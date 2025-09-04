from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = '../.secure/service_account.json'

creds = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=creds)

folder_id = '1Y5Wj43GbdtScjPo4Y2w-N4yCaWG5q89a'
png_folder = "../first_face_algs_png"
file_ids = {}

for filename in os.listdir(png_folder):
    if filename.endswith('.png'):
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
        media = MediaFileUpload(os.path.join(png_folder, filename), mimetype='image/png')
        file = drive_service.files().create(body=file_metadata,
                                            media_body=media,
                                            fields='id').execute()
        file_id = file.get('id')
        
        basename = os.path.splitext(filename)[0]
        file_ids[basename] = file_id
        
        # Make public (set permission)
        drive_service.permissions().create(
            fileId=file_id,
            body={'type': 'anyone', 'role': 'reader'}).execute()
        
print(file_ids)
# After uploading and populating file_ids
with open("uploaded_file_ids.json", "w") as outfile:
    json.dump(file_ids, outfile, indent=2)
