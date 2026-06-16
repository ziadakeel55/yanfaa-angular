import json
import re
import asyncio
from pyrogram import Client

API_ID = 26652708
API_HASH = '2300480334a5285559a49cc0f908de9d'
TARGET_CHATS = [-5281229439, -1003753481209]
INPUT_FILE = 'yanfaa_PAID_courses.json'

app = Client('my_yanfaa_account', api_id=API_ID, api_hash=API_HASH, sleep_threshold=120)

def sanitize_name(name):
    if not name: return 'Unknown'
    return re.sub(r'[\\/*?:"<>|]', '-', str(name)).strip()

async def main():
    print('Loading courses...')
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        courses = json.load(f)
    
    course_by_title = {}
    videos_by_course = {}
    
    for c in courses:
        cid = c.get('id')
        ctitle = sanitize_name(c.get('title'))
        course_by_title[ctitle] = cid
        videos_by_course[cid] = {}
        for v in c.get('videos', []):
            vid = str(v.get('brightcove_video_id') or "").strip()
            if not vid: continue
            vtitle = sanitize_name(v.get('title'))
            videos_by_course[cid][vtitle] = vid

    found_intros = set()
    found_videos = set()
    unmatched_intros = []
    unmatched_courses = []
    unmatched_video_titles = []
    skipped_messages_no_dash = []
    
    # Store video mapping
    telegram_map = {}

    
    print('Fetching messages from Telegram...')
    async with app:
        print('Caching dialogs to resolve peer ID...')
        async for dialog in app.get_dialogs():
            pass
            
        for chat_id in TARGET_CHATS:
            print(f'Scanning chat {chat_id}...')
            try:
                async for msg in app.get_chat_history(chat_id):
                    text = msg.caption or msg.text
                    if not text: continue
                    
                    text_lines = text.strip().split('\n')
                    if not text_lines: continue
                    
                    # Intro: '📌 **الكورس:** CourseName'
                    if '📌' in text_lines[0]:
                        # Remove emoji, bold markers, and Arabic prefix
                        raw_title = text_lines[0]
                        for token in ['📌', '**', 'الكورس:']:
                            raw_title = raw_title.replace(token, '')
                        raw_title = raw_title.strip()
                        cid = course_by_title.get(raw_title)
                        if cid:
                            found_intros.add(f'INTRO_{cid}')
                        else:
                            unmatched_intros.append(raw_title)
                            
                    # Video: '🎬 03 - Lesson 3.mp4\n📁 كورس: Learning Spanish A1 Revision'
                    elif '🎬' in text_lines[0]:
                        if len(text_lines) < 2: continue
                        file_name_part = text_lines[0].replace('🎬', '').replace('**', '').strip()
                        # Course line: '📁 كورس: CourseName'
                        course_line = text_lines[1]
                        for token in ['📁', '**', 'كورس:']:
                            course_line = course_line.replace(token, '')
                        course_part = course_line.strip()
                        
                        cid = course_by_title.get(course_part)
                        if cid:
                            if ' - ' in file_name_part:
                                vtitle = file_name_part.split(' - ', 1)[-1].replace('.mp4', '').strip()
                                vid = videos_by_course[cid].get(vtitle)
                                if vid:
                                    found_videos.add(f'{cid}_{vid}')
                                    telegram_map[vid] = {"msg_id": msg.id, "chat_id": chat_id}
                                else:
                                    # Fuzzy fallback
                                    matched = False
                                    for known_vtitle, known_vid in videos_by_course[cid].items():
                                        if vtitle.startswith(known_vtitle) or known_vtitle.startswith(vtitle):
                                            found_videos.add(f'{cid}_{known_vid}')
                                            telegram_map[known_vid] = {"msg_id": msg.id, "chat_id": chat_id}
                                            matched = True
                                            break
                                    if not matched:
                                        unmatched_video_titles.append(f"{course_part} -> {vtitle}")
                            else:
                                skipped_messages_no_dash.append(file_name_part)
                        else:
                            unmatched_courses.append(course_part)
            except Exception as e:
                print(f"Error scanning chat {chat_id}: {e}")
    
    history = found_intros.union(found_videos)
    with open('ultimate_history_synced.txt', 'w', encoding='utf-8') as f:
        for h in sorted(history):
            f.write(h + '\n')
    
    report = []
    report.append(f"Total Intros found: {len(found_intros)}")
    report.append(f"Total Videos matched: {len(found_videos)}")
    report.append(f"Unmatched Intros: {len(unmatched_intros)}")
    report.append(f"Unmatched Courses: {len(set(unmatched_courses))}")
    report.append(f"Unmatched Video Titles in known courses: {len(unmatched_video_titles)}")
    report.append(f"Skipped messages (No ' - ' in title): {len(skipped_messages_no_dash)}")
    if unmatched_intros:
        report.append("\n--- Unmatched Intros ---")
        for x in sorted(set(unmatched_intros)):
            report.append(f"  {x}")
    if unmatched_courses:
        report.append("\n--- Unmatched Video Courses ---")
        for x in sorted(set(unmatched_courses)):
            report.append(f"  {x}")
            
    if unmatched_video_titles:
        report.append("\n--- Unmatched Video Titles (Sample) ---")
        for x in unmatched_video_titles[:50]:
            report.append(f"  {x}")
            
    if skipped_messages_no_dash:
        report.append("\n--- Skipped Messages No Dash (Sample) ---")
        for x in skipped_messages_no_dash[:50]:
            report.append(f"  {x}")
            
    report.append("\nSaved to ultimate_history_synced.txt")
    
    with open('telegram_videos.json', 'w', encoding='utf-8') as f:
        json.dump(telegram_map, f, indent=2)
    report.append("Saved video mappings to telegram_videos.json")
    
    with open('sync_report.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))
    print('\n'.join(report))


app.run(main())
