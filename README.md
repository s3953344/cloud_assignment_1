# cloud_assignment_1
By Frederick Hadi (s3953344)
 
Semester 1 2025

To run the client application, from the root folder run:
- cd ./frontend
- npm install
- npm run dev

The development build runs on port 5173.

Also run npm install to run the task 1 and task 2 scripts in the "./task1and2" directory. Run them with node. Uses credentials stored in .aws/credentials.

## Hosting on EC2 instance
- Start lab, put creds in credentials.json
- npm run build
- Get the EC2 Public IPv4 DNS, it changes every time you start the lab. Connect with FileZilla and PuTTy
- Upload newly built dist/ folder into /home/ubuntu
- connect with PuTTy, remember to use new Public IPv4 DNS
- sudo cp -r ~/dist/* /var/www/html/
- sudo service apache2 start
- open up the link. remember to use http://