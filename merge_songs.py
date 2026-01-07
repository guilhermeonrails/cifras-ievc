import re
import json

def parse_js_songs(content):
    # This is a heuristic parser. It assumes standard formatting as seen in the file.
    # It tries to find objects inside the array.
    
    songs = []
    
    # We will iterate through the file and look for 'id:', 'title:', 'chord_text:'
    # But since chord_text uses backticks and can be multiline, we need to be careful.
    
    # Let's try to split by some delimiter or parse sequentially.
    # Given the complexity, a state-machine or regex that finds individual song blocks is best.
    
    # We can split by "id:" but that might appear in text.
    # However, "id: " at the start of a line (with whitespace) is robust in this specific file format.
    
    # Let's use specific regex to extract fields.
    
    # Pattern to find a song object. 
    # We assume it starts with { and contains id, title, chord_text.
    # This is slightly risky if strict JSON parsing isn't possible.
    # Let's try to load it by making it JSON-compatible? 
    # No, backticks and loose keys make it invalid JSON.
    
    # Workaround: Identify blocks.
    # Each song seems to start with `  {` and end with `  },` or `  }`
    
    objects = []
    current_obj = {}
    
    # We'll use a regex to capture each song block roughly.
    # But chord_text `...` is the hardest part.
    
    # Let's iterate line by line to build objects.
    
    lines = content.split('\n')
    current_song = None
    in_chord_text = False
    chord_text_buffer = []
    
    for line in lines:
        stripped = line.strip()
        
        if stripped == '{':
            current_song = {}
            continue
            
        if stripped.startswith('},') or stripped == '}':
            if current_song is not None:
                if 'title' in current_song: # Valid song
                     songs.append(current_song)
                current_song = None
            continue
            
        if current_song is not None:
            # Check for id
            m_id = re.match(r'id:\s*(\d+)', stripped)
            if m_id:
                current_song['id'] = int(m_id.group(1))
                continue
            
            # Check for title
            m_title = re.match(r'title:\s*"(.*)"', stripped)
            if m_title:
                current_song['title'] = m_title.group(1)
                continue
            
            # Check for chord_text start
            if 'chord_text:' in stripped:
                # Check if it starts with backtick
                if '`' in stripped:
                    in_chord_text = True
                    # Content after the backtick?
                    start_tick = line.find('`')
                    # If the backtick is the last char, we just start buffering
                    # If there is content, we take it.
                    # Usually it's `\n
                    
                    # Handle one-liner `text`
                    if line.count('`') == 2:
                        # Extract content between backticks
                        text = line[start_tick+1:line.rfind('`')]
                        current_song['chord_text'] = text
                        in_chord_text = False
                    else:
                        # Multiline
                        chord_text_buffer = []
                        # If there is text after first backtick
                        after_tick = line[start_tick+1:]
                        if after_tick:
                            chord_text_buffer.append(after_tick)
                elif '""' in stripped or "''" in stripped:
                     current_song['chord_text'] = ""
                continue
            
            if in_chord_text:
                if '`' in stripped and not stripped.startswith('`'): 
                   # This logic is flawed if ` is in layout. 
                   # But typically ` ends the string.
                   # Let's assume ` at end of line closes it?
                   if line.strip().endswith('`') or line.strip() == '`':
                       end_tick = line.rfind('`')
                       if end_tick > -1:
                            chord_text_buffer.append(line[:end_tick])
                       current_song['chord_text'] = '\n'.join(chord_text_buffer)
                       in_chord_text = False
                   else:
                       chord_text_buffer.append(line)
                elif stripped == '`' or stripped.startswith('`'):
                     # Ending backtick on new line/start
                     if stripped == '`,':
                         # end
                         current_song['chord_text'] = '\n'.join(chord_text_buffer)
                         in_chord_text = False
                     elif stripped == '`':
                         current_song['chord_text'] = '\n'.join(chord_text_buffer)
                         in_chord_text = False
                     else:
                        # Could be `...` line?
                        chord_text_buffer.append(line) # risky
                else:
                    chord_text_buffer.append(line)

    return songs

def main():
    songs_path = '/Users/guilhermelima/Desktop/cifras-ievc/songs.js'
    cifras_path = '/Users/guilhermelima/Desktop/cifras-ievc/cifras.js'

    with open(songs_path, 'r', encoding='utf-8') as f:
        songs_content = f.read()

    with open(cifras_path, 'r', encoding='utf-8') as f:
        cifras_content = f.read()

    existing_songs = parse_js_songs(songs_content)
    new_candidates = parse_js_songs(cifras_content)

    print(f"Parsed {len(existing_songs)} existing songs.")
    print(f"Parsed {len(new_candidates)} candidate songs.")
    
    # 1. Determine max ID
    max_id = 0
    existing_titles = set()
    for s in existing_songs:
        if 'id' in s and s['id'] > max_id:
            max_id = s['id']
        if 'title' in s:
            existing_titles.add(s['title'].lower().strip())
    
    print(f"Max ID is {max_id}")

    # 2. Filter and Process new songs
    songs_to_add = []
    
    for s in new_candidates:
        if 'title' not in s:
            continue
        
        t = s['title'].lower().strip()
        if t in existing_titles:
            print(f"Skipping duplicate: {s['title']}")
            continue
        
        # New song!
        max_id += 1
        new_song = {
            'id': max_id,
            'title': s['title'],
            'chord_text': s.get('chord_text', ''),
            'chart_image': "",
            'charts': [
                {'tone': "C", 'image': ""},
                {'tone': "D", 'image': ""}
            ]
        }
        songs_to_add.append(new_song)
        existing_titles.add(t) # prevent duplicates within new list if any

    print(f"Adding {len(songs_to_add)} new songs.")

    if not songs_to_add:
        print("No new songs to add.")
        return

    # 3. Format and Append
    # We need to construct the JS strings for these new objects
    
    entries = []
    for s in songs_to_add:
        # Proper escaping for title? Usually just double quotes, but watch out for quotes in title.
        title_esc = s['title'].replace('"', '\\"')
        
        # Chord text should be wrapped in backticks.
        # Ensure we don't break backticks inside? Unlikely in chord text usually?
        # But if there are backticks, we might check.
        # Assuming standard text.
        
        # Structure requested:
        # {
        #     id: 40,
        #     title: "",
        #      chord_text: `
        # 
        #     `
        #     ,
        #     chart_image: "",
        #     charts: [
        #       { tone: "C", image: "" },
        #       { tone: "D", image: "" },
        #     ]
        #   }
        
        entry = "  {\n"
        entry += f"    id: {s['id']},\n"
        entry += f"    title: \"{title_esc}\",\n"
        entry += f"    chord_text: `{s['chord_text']}`,\n"
        entry += f"    chart_image: \"\",\n"
        entry += f"    charts: [\n"
        entry += f"      {{ tone: \"C\", image: \"\" }},\n"
        entry += f"      {{ tone: \"D\", image: \"\" }},\n"
        entry += f"    ]\n"
        entry += "  }"
        entries.append(entry)
        
    entries_str = ",\n".join(entries)
    
    # Append to songs.js before the closing ]
    # Find the last ]
    # The file ends with ].sort(...) or just ];
    
    match = re.search(r'\]\.sort', songs_content)
    if not match:
        match = re.search(r'\];', songs_content)
        
    if match:
        insert_pos = match.start()
        # Ensure we add a comma to the previous last element if needed?
        # The split logic might be tricky.
        # Easier: splice it in.
        
        # Check if the text before ] has a comma.
        # We can look backwards from insert_pos.
        # But simpler is to assume we might need a comma.
        
        prefix = songs_content[:insert_pos].rstrip()
        suffix = songs_content[insert_pos:]
        
        # If the last character is not a comma, add one.
        # Be careful of whitespace.
        # If it ends with }, that's cool.
        
        # Let's see what the filtered parsing showed for the last object.
        # Actually parsing didn't preserve the file content exactly, just extracted data.
        
        # I will check if prefix ends with ','
        # If not, add it.
        
        # Actually, let's just make sure.
        if not prefix.strip().endswith(','):
             prefix += ","
        
        new_content = prefix + "\n" + entries_str + "\n" + suffix
        
        with open(songs_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully merged files.")
    else:
        print("Could not find end of array in songs.js")

if __name__ == "__main__":
    main()
