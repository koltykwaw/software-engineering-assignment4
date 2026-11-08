# Smart Campus Room Availability Checker

Software Engineering Assignment #04. This frontend checks a fictional single-day schedule and never writes bookings. Room filters use inclusive capacity and require all selected equipment. A blocked room can match filters but cannot be available.

## Run and verify

Use Node.js 24 and npm. From this directory:

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run typecheck:tests
npm run lint
npm run build
```

Open the local URL printed by Vite. The automated suite uses the built-in Node test runner with tsx and a simulated browser DOM through jsdom. The integration tests exercise React behavior and do not measure browser layout.

## Compare the original and final rule engines

Extract the original ZIP separately. Run the same 15 cases against each source tree. In PowerShell, replace the sample path with the original project's src directory:

```powershell
$env:SMART_CAMPUS_SOURCE = 'C:/path/to/extracted-initial/project/src'
npx --no-install tsx --tsconfig tsconfig.test.json --test verification/availability.test.mjs
Remove-Item Env:SMART_CAMPUS_SOURCE
npx --no-install tsx --tsconfig tsconfig.test.json --test verification/availability.test.mjs
```

The original is expected to fail two cases and return a nonzero exit status. The final source is expected to pass all 15. The comparison suite runs separately from npm test.

## Reproduce the demo

- At simulated 09:00, check 09:30–10:30 in Athena Hall. Switch to Newton Lab and verify the old result clears. Check again to see the available result. Da Vinci Studio remains blocked.
- Select Projector and Whiteboard. At 40 attendees only Newton Lab matches. At 41 the list is empty and checking is disabled.
- With Athena Hall selected and no equipment filters, set simulated time to 23:00 and check 23:30–24:00. The end should display as 24:00.

## Source map

- src/lib/data.ts and types.ts describe rooms, equipment and bookings.
- src/lib/filterRooms.ts handles attendee and equipment eligibility.
- src/lib/availability.ts validates time, blocked status and selected-room overlap.
- src/lib/time.ts owns parsing, formatting and default intervals.
- src/App.tsx manages the form, active room and result. src/components renders the views.
- tests contains unit tests and React integration tests.
