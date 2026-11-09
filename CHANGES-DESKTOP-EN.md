# RGA website updates

- Default language is English for new visitors on both index and dashboard.
- Previous language choice remains saved in localStorage (key: `lang`); choosing Arabic still works.
- Initial HTML direction is LTR with an early startup script to restore saved Arabic before rendering.
- Desktop dashboard containers, header button wrapping and cards have responsive layout safeguards.
- Removed a duplicate opening `<body>` tag from dashboard.html.

Upload all files to the site host, keeping the same directory structure. Browser cache may need a hard refresh after deployment.
