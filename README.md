# Rufus

Rufus is a simple email server (based on Haraka), that accepts email for a given domain, and forwards it to your own API.

Minimal parsing is done on the email, and all headers are forwarded. Attachments are currently not supported.

## Configuration

Configuration can be found in `config/deliver_api.json`.

**secretkey:** This key is the base for the hash used to make sure that emails delivered to the API actually come from the Rufus server.
**endpoint:** The API end point to deliver email to.

In addition, don't forget to modify `config/host_list` to include the domains you want to receive email for.