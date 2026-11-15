# Survey Corps Archive Project Report

**Course:** Web Technologies endterm  
**Group:** SE-2540  
**Team:** Assem Tugelbay, Zhansaya Boranbaikyzy, Alina Ibadulla

## Project objective

Survey Corps Archive is an unofficial *Attack on Titan* fan website. It organizes story and character information into a responsive, seven-page site and demonstrates the HTML, CSS, JavaScript, jQuery, localStorage and public API features required for the endterm project.

## Website structure

The site contains Home, Lore, Titan archive, Characters, Episodes, Sign in and Enlist pages. Each page uses the shared navigation and visual style. `index.html` introduces the archive; `about.html` covers the setting and factions; `titans.html` presents an editable Titan table and image gallery; `characters.html` loads character data; `episodes.html` provides a season guide; and `signin.html` and `join.html` demonstrate validated forms.

## Implemented features

- Responsive layouts, shared navigation and a light/dark theme saved in `localStorage`.
- Demo sign-in that stores a non-sensitive profile and keeps the session after reload. Passwords are checked and discarded; there is no server.
- Titan table search, filters, add/view/edit/delete controls, reset action and image gallery.
- Character data requested from Jikan and AniList. The first valid response is normalized and shown with search, role filters, sorting, profiles, favourites, a ten-minute cache and an offline fallback list.
- Form validation and a registration card on the Enlist page.
- Seven-question FAQ with jQuery `slideToggle()` animations.

## Development process

The project continues the group’s midterm topic and front-end structure. The endterm version expands the site to seven pages, adds the required interactive features, stores demo preferences and records locally, and retrieves character data from public APIs. HTML, CSS, JavaScript, Bootstrap, jQuery, fonts and images are included in the repository; no build step or server is needed for the static pages. The API-backed Characters page needs an internet connection for live results.

## Team responsibilities

- **Assem Tugelbay:** home page, shared header/footer and CSS.
- **Zhansaya Boranbaikyzy:** lore page, Titan table, search and gallery.
- **Alina Ibadulla:** episode page, registration form and responsive checks.

## Screenshots

![Home page](screenshots/home-desktop.jpg)

![Lore page](screenshots/about-desktop.jpg)

![Titan archive](screenshots/titans-desktop.jpg)

![Episode guide](screenshots/episodes-desktop.jpg)

![Enlist page](screenshots/join-desktop.jpg)

## Links and credits

- Repository: https://github.com/asemtygelbaeva-byte/survey-corps-archive
- Website: https://asemtygelbaeva-byte.github.io/survey-corps-archive/
- Image sources and licences: [ASSET_SOURCES.md](ASSET_SOURCES.md)

Character data is provided by the [Jikan API](https://jikan.moe/) and [AniList API](https://anilist.co/). *Attack on Titan* and its artwork belong to their respective rights holders. This is an unofficial student project.

## AI use

AI tools assisted with code review, API error handling and documentation. The project team reviewed and is responsible for the submitted work.
