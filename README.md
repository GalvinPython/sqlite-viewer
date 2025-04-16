# SQLite Reader

[A web app where you can view your SQLite database](https://sqlitereader.com)

# Changelog

## 16/04/2025
- Simplified the upload system on the `index.tsx` page to automatically show the database after the file is selected instead of waiting for the user to click the upload button for confirmation

## 25/03/2025

- Added puppeteer script to generate embed images
    - Storytime: MicroLink uses DigitialOcean for its services, however I had to block DigitalOcean as I was getting 1,000+ requests an hour sometimes trying to "exploit" wordpress stuff, so I just straight up blocked the ASN :p
    - Embed script requires port 8010 to run on so make sure to **build** the site first then run it alongside the embed script

## 18/03/2025

- Added footer to site
- Updated `sql.js` from 1.12 to 1.13

## 14/03/2025

- Removed API/backend for parsing SQLite databases
- Moved everything to local processing using `sql.js`
- Added SQLite exports to the following languages
    - csv
    - json
    - sql
- Updated `next.js` to resolve 1 security advisory
