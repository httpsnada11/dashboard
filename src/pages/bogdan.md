CopyM Pay — UI Audit: Merchant Portal & Admin Console
Summary
Both consoles look modern and well structured, but they need about a week of fixes before an external demo. There are some issues and blockers. The blockers are mainly authentication, unconfirmed money and compliance actions, and risky compliance wording.
CopyM Pay is currently a front-end prototype. All data is mock, sign-in is a browser storage flag, and no API calls are made. Most findings are about what the UI shows and implies, and about patterns that must not carry into the real build.
Scope: merchant portal at copym-pay.vercel.app (login, register, reset, MFA and all 11 sections) and admin console at /admin/overview (all 7 sections). Tested at 1440×900, 1024×768 and 375×812.
Finding IDs: P = blocker, M = merchant, A = admin. Severity: S1 fix before demo, S2 next sprint, S3 polish.
Release blockers
These nine issues would embarrass CopyM in front of a partner or investor, or would become real security holes if copied into the production build.
ID
Console
Blocker
Fix
P1
Both
Merchant sign-in unlocks the admin console. After merchant login, /admin/overview opens with no admin login or 2FA. Both roles share one browser flag (copym_auth_session).
Use role-scoped sessions with a server-side role check. Host admin on its own subdomain behind SSO or an IP allowlist.
P4
Admin
Internal architecture is public. The System Health tab lists MySQL, Redis, Celery/Bull, Fireblocks node regions, RPC vendors (TronGrid, Alchemy, Triton, QuickNode) and "$30,000,000 Total Custody". The bundle also contains a hidden route, /ops-7x9k.
Turn on Vercel password protection for the deployment now. Replace infrastructure names with generic labels in demo copy.
P5
Merchant
Money moves in one click. Payout "Approve" runs at once. "Review payout" skips the review step and creates the payout. API key "Revoke" deletes with no prompt. I approved 8,750 USDC alone, though Settings says payouts over $5,000 need a second checker.
Add a confirmation dialog showing amount and address, plus 2FA for payouts. Enforce the maker-checker rule in the UI.
P6
Admin
Compliance actions take one click and leave no trace. These run with no reason or note and never appear in the "Immutable Audit Trail": "Clear False Positive" on a 92/100 Tornado Cash alert, "Refund", KYB "1-Click Approve" (even with a document "Pending OCR"), "Instant Approve" (skips the 24h timelock) and "Trigger Cold Storage Sweep".
Require a reason code and note, plus a second approver for overrides. Write every action to the audit log.
P7
Merchant
A competitor's brand is in the UI. "CoinsPaid Standard" appears in the Deposits hero and "CoinsPaid Pipeline Engine active" in the table footer.
Remove both.
P8
Both
Claims that need legal sign-off. "You Receive (Guaranteed)" and "Zero slippage pool" (Convert). "Compliant with FATF Recommendation 16 & EU AMLS Directive" (KYB gate). "Enforced by hardware security modules" (Audit). "Eliminate withdrawal fraud" (Settings). "Guaranteed" is on CopyM's banned-word list.
Rewrite using the wording table under Cross-cutting issues, then send for legal review.
P9
Merchant
Consent is pre-ticked on Register. The Terms checkbox starts checked and is not required. "Terms of Service" and "Privacy Policy" are plain text, not links.
Leave the box unchecked and required, and link both documents.

Merchant portal (copym-pay.vercel.app)
The merchant portal is the stronger of the two consoles. Navigation is clear and the Team, Developers and Exceptions pages are close to demo quality. Its main problems are broken navigation history, numbers that disagree between pages, a non-working Convert screen, and dropdowns that won't close.
ID
Sev
Where
Issue
Fix
M1
S2
Login
Labels aren't linked to their inputs (empty for). There are no autocomplete attributes, so password managers and screen readers struggle.
Add id and for, plus autocomplete="email" and "current-password".
M2
S2
Login
The email placeholder is the same as the pre-filled value, so a hint can't be told apart from a value.
Use name@company.com as the placeholder and leave the field empty.
M3
S3
Login
The browser's native validation bubble fires before the custom red alert, so errors appear in two styles.
Add noValidate to the form and use the custom alert.
M4
S3
Login
There is no show-password toggle, though Register has one.
Add the same eye toggle.
M5
S2
Reset password
The logo disappears on this screen. The success text ("dispatched to merchant@gmail.com") confirms the account exists. The heading stays "Reset your password", and there are two back links.
Keep the logo. Use "If an account exists for this email, we've sent a link." Change the heading to "Check your inbox".
M6
S2
Register
The helper says "8 characters, 1 number, 1 special character", but the code only checks length.
Validate all three rules and show a live checklist.
M7
S3
Register
The brand is written "CopyM-Pay" here and "CopyM Pay" everywhere else.
Use "CopyM Pay".
M8
S3
Login + MFA
Both screens ask the same thing: "Remember this device" on login and "Trust this device" on MFA.
Ask once, on the MFA step.
M9
S3
All auth
Demo emails use gmail.com, a real domain.
Use example.com.
M10
S1
Navigation
At /, sidebar clicks don't change the URL. Under /merchant/* they replace history, so Back skips every section and a refresh can drop context.
Use pushState routes for every section.
M11
S1
Header menus
The notifications and profile dropdowns don't close on outside click or Esc. Both can be open at once and overlap.
Close on outside click, Esc and when the other menu opens.
M12
S2
Global search
Search does nothing: no results appear and Enter is ignored.
Wire it up, or hide it until it works.
M13
S2
All modals
Modals have no role="dialog" or aria-modal. Esc doesn't close them and focus stays on the page behind.
Use one modal component with focus trap, Esc to close and focus return.
M14
S2
Identity
The header shows Daniel Vance (Merchant Owner), but the Team page lists "Nora Vale · You" as Owner. Merchant team emails are @copym.com.
Use one signed-in persona and a merchant domain.
M15
S3
Header
Tooltips leak icon names: "Refresh Transactions (RotateCcw)", "(Play)", "(Key)", "(Lock)". A demo control, "Switch Progressive Unlock Stage for Demo", sits in the header.
Clean the labels and move demo controls behind a demo flag.
M16
S3
Sidebar
The active item shows a chevron that does nothing. The subtitle reads "checkout your recent financial activity".
Remove the chevron. Fix the subtitle to "Check out…" or drop it.
M17
S3
Browser tab
The title reads "CopyM Pay — Merchant Treasury Portal (:3000)" and briefly flashes "Merchant Dashboard". There is no meta description, and the favicon is a generic green shape.
Use "CopyM Pay — Dashboard" (per page) and the real logo as favicon.
M18
S1
Dashboard
The balance card shows a rounded 56,768 US$ over "56,768.98 USDT", mixing units. Create payout says "Available in vault 248,320.17 USDT".
Use one balance source. Show the exact amount in its asset unit, with the USD estimate secondary.
M19
S2
Dashboard
At 1024px the quick actions shrink to "D..", "P.." and "S..". The USD-estimate line overlaps the address and "Client:" is clipped. On mobile it reads "Depo…".
Stack icon over label in the tiles and let the payout card wrap.
M20
S3
Dashboard
The quick action says "Swapp" (typo), while the sidebar calls the same thing "Convert".
Use "Convert" in both.
M21
S2
Dashboard
Past payouts are dated 25 Aug while deposits are 28 Oct. Recent-activity IDs don't exist on the Deposits page.
Draw both widgets from the same mock dataset.
M22
S2
Deposits
Chips say "All 1,248" and "Exception 12", but the table shows 8 rows and the Exceptions page lists 6. Status "KYT review" has no chip.
Derive chip counts from the data and add the missing status.
M23
S2
Deposits
Engineering jargon faces merchants: "Inbound Crypto Ingestion Engine", "DUAL CASHIER ARCHITECTURE".
Retitle to "Deposits" with a one-line plain description.
M24
S3
Deposits
A credited deposit's modal offers "Open Deposit Checkout & QR". "Expected: —" on hosted-checkout rows isn't explained.
Hide checkout for settled deposits and add a tooltip for "—".
M25
S2
All tables
Header styles differ: dark on Dashboard, Exceptions, Team and Developers, light on Deposits. At 1024px the Deposits Action column scrolls off-screen. On mobile, wide tables scroll sideways.
Use one table style with a sticky action column, and card rows below 768px.
M26
S2
Exceptions
After "Approve & Settle", the row says Settled but the chips still show "Pending 4" and "Settled 1", and no toast appears. The only choices are Approve or Flag. The footer says "sample exceptions".
Recount chips and add a success toast. Add a "Return to sender" option for mismatches. Remove "sample".
M27
S2
Create payout
The form pre-fills an amount and a fake 31-character TRON address. Purpose is free text showing the raw value CUSTOMER_WITHDRAWAL. The primary button is grey. A new payout is instantly tagged "KYC verified · sanctions clear".
Start the form empty. Make Purpose a dropdown, use brand green and show "Screening…" first.
M28
S2
Payouts
The same payout (pay_7NK9) scores 08 (Low) here and 78 (Critical) in admin.
Share one risk score between the consoles.
M29
S3
Address book
The heading shows an internal ticket ID, "(FE-07)". It uses "anti-theft" and "anti-hijack" wording and a vendor name, "(BitGo)".
Title it "Payout addresses · 24h security hold".
M30
S1
Convert
"You Receive" stays at 1,000.00 whatever amount you type. The swap icon can't be clicked. There is no rate, fee or quote expiry. "Convert Instantly" does nothing visible.
Calculate the output and show rate, fee and quote timer. Add a review step and a success state.
M31
S3
Balances
There are only three cards. USDT combines TRC-20 and ERC-20, and nothing shows pending or locked funds.
Split by network and add available, pending and locked.
M32
S3
Statements
Two static items, with no date range or custom export.
Add a period picker and CSV or PDF export.
M33
S2
Settings
"Changes take effect instantly" sits next to "Save policy" and "Publish to prod". There are two toggle styles. The page opens on Financial Controls. The "Team & Access" tab duplicates the sidebar's "Team & security".
Use one save model and one toggle style. Open on General and remove the duplicate tab.
M34
S2
KYB flow
The gate modal and banner use blue buttons. A "DEMO STATE" switcher shows inside the modal. The wizard passes all 5 steps with no required uploads.
Use brand green, hide demo controls and require documents before submit.
M35
S3
Developers
The simulator lists a "Base" network that appears nowhere else. One key is labelled "LIVE - DEMO".
Align network lists and use "Live" or "Sandbox" only.
M36
S3
Mobile
The compliance banner takes about 40% of the first screen. The Sandbox/Live indicator is hidden on mobile.
Collapse the banner to one line and keep a mode pill in the header.

Admin console (/admin/overview)
The admin console has the right modules for an operations team: KYT queue, KYB, whitelist, exceptions, maker-checker, logs and audit. It is the weaker console for a demo, though. It shows the merchant's identity, hides its key action columns, and its counts and data contradict each other and the merchant portal. The Co-Sign modal is the strongest pattern in either console: it shows a maker and checker summary and requires a 2FA token. Every other high-risk action should use it.
ID
Sev
Where
Issue
Fix
A1
S1
Header
The admin header shows the merchant user "Daniel", merchant icons (Simulate payments, API keys) and the merchant's "AML Risk Low" widget. The Co-Sign modal names the checker as "Sarah Chen".
Build an admin-only header with operator name, role, environment and session timer.
A2
S1
Maker-Checker, Audit
At 1440px, the Maker-Checker table (1,362px wide in a 1,134px area) hides the Checker Action column. The Audit Trail (1,486px in 1,081px) hides the hash and Verify columns.
Pin the action column and merge Maker with Merchant. Move the hash into a row drawer.
A3
S2
Counts
Badges disagree. The KYT page shows "3 Critical KYT Flags" and "3 Pending" in the header, "2 Pending" on the tab, and 5 rows in the queue. Score 78 is labelled Critical though the Critical filter means 90+. Clearing an alert doesn't change the header badges. After a KYB approval, the badge still says "2 Pending" while the KPI says 1. Whitelist says "2 in cooling" but its KPI says 4.
Compute every badge from the same list and re-render after each action.
A4
S2
All modals
The sticky header stays bright above the modal overlay (header z-index 40 sits outside the overlay's stacking).
Render modals in a portal at body level.
A5
S2
Routing
The URL /admin/overview opens "AML & KYT Attention Queue". There is no Overview page or nav item.
Add a real overview (KPIs plus queues needing action), or rename the route to /admin/kyt.
A6
S2
System Health, Sweeps
The policy says 95% cold / 5% hot, but the bar shows 92.9% / 7.1% labelled "Balanced". The hot buffer is USD 2,140,500 on Health and USD 342,100 on Sweeps. Verified merchants are "processing unlimited volume" next to daily limits of 500k.
Flag out-of-policy states in amber and use one data source. Remove "unlimited".
A7
S2
Cross-console
Admin and merchant data don't match. Exception IDs are exc_7MV2.. in merchant and EXC-8491 in admin. Approving the KYB in admin leaves the merchant "Under review". pay_3LX8 belongs to Eagle Vision in admin but to the signed-in merchant in the portal.
Use one shared mock store and one ID scheme per object.
A8
S2
People
The same names appear as merchant staff and platform staff: Elena Rostova (merchant VP Finance and platform Risk Analyst), Marcus Vance and David Zhang. In a compliance demo this reads as a conflict of interest.
Give the platform team its own names.
A9
S2
Sample data
"Shadow OTC Trading Group · Panama (Unregulated) · Anonymous Nominee" looks cartoonish. "apexliquidity.com" may be a real domain. Hashes like 0x12839401...123456 are obviously fake.
Use neutral fictional names, example.com and realistic random hashes.
A10
S2
Audit Trail
Actions taken in the session are never logged. Entries are dated 12 Nov while exceptions are "12 mins ago". The trail says EXC-8491 was resolved, but Exceptions shows it pending. "Address Freezed" is ungrammatical.
Append an event for every action. Align the dates and use "Address frozen".
A11
S2
Colour
Primary buttons use purple ("Freeze Wallet"), blue ("Instant Approve") or a red-brown hero gradient.
Use one primary (green), one destructive (red) and one neutral style.
A12
S3
Copy
"Google Authenticator" and "Platform Master Password" (implies a shared password).
Use "authenticator app" and "Password".
A13
S3
KYB dossier
"1-Click Approve" stays enabled while a document is "Pending OCR". There are no UBO, screening or reviewer-note sections. Documents can't be opened. A "BTC (Native)" rail appears only here.
Disable approval until checks pass. Add UBO, screening and notes sections and a document viewer.
A14
S3
Mobile
KPI cards stack one per row, so the queue starts about four screens down. The table search shrinks to "Se". Developer text "Touch scroll active" is visible.
Use a 2×2 KPI grid and a full-width search, and remove the dev text.
A15
S3
Maker-Checker
Rows have checkboxes but there is no bulk-action bar.
Add bulk Co-Sign and Hold, both with 2FA, or remove the checkboxes.

Cross-cutting issues
The brand green fails contrast on every primary button, and the copy makes compliance and vendor claims CopyM can't yet back. Both are cheap to fix with a token change and a copy pass.
Accessibility and design tokens
White 14px bold text on the brand green #00C076 gives 2.39:1 contrast. WCAG AA needs 4.5:1. Green links on white fail the same way ("Forgot password?", "View all").
Fix: use #007F4E (5.07:1) for buttons and links. Keep #00C076 for icons, pills and large accents.
Grey #9CA3AF text (2.54:1) appears about 280 times in the bundle. Text of 9–10px appears about 158 times and 11px about 272 times.
Fix: set 12px as the minimum size and use #6B7280 (4.83:1) for secondary text.
Accent colours drift: blue (KYB, review banner), purple (Freeze), grey primary (Create payout). Table headers come in dark and light versions, and toggles in two styles.
ID formats differ for similar objects: dep_9KX4..Q72, EXC-8491-LATE, pay_3LX891280a9bC51, po_5k5..1e4.
Fix: pick one pattern per object type, such as dep_, exc_ and pay_ with the same truncation everywhere.
Wording to change
These phrases conflict with CopyM's wording rules (no guarantees, no implied regulatory approval, no unconfirmed integrations).
Where
Current
Suggested
Convert
You Receive (Guaranteed)
You receive (Estimated)
Settings
Eliminate withdrawal fraud and internal malfeasance
Help reduce the risk of unauthorized withdrawals
Statements
Certified SHA-256 Hash Digest
SHA-256 checksum
Payouts
Biometric 2FA confirmed · Chainalysis clean
Screening passed · 2FA verified
Deposits
CoinsPaid Standard / CoinsPaid Pipeline Engine active
Remove
Deposits
Inbound Crypto Ingestion Engine
Deposits
Address book
Mandatory 24h Anti-Theft Address Whitelist (FE-07)
Payout addresses · 24h security hold

Fix order
Work in three passes. The first pass makes the build safe to show externally, the second makes it consistent, and the third polishes it.
Pass 1: before any external demo (about 3–5 dev days)
☐ Turn on Vercel password protection and split the merchant and admin sessions (P1, P4)
☐ Clear the pre-filled credentials, untick remember-device, and remove the demo MFA code (P2, P3)
☐ Add one shared confirm-and-reason modal, based on the admin Co-Sign pattern, to every money and compliance action (P5, P6)
☐ Remove CoinsPaid and apply the wording table (P7, P8)
☐ Untick and require Register consent, and link Terms and Privacy (P9)
☐ Fix routing history, dropdown closing and the Convert calculation (M10, M11, M30)
☐ Unify the balance and give admin its own header (M18, A1)
☐ Pin the action columns on the admin tables (A2)
Pass 2: consistency (next sprint)
☐ Use one shared mock data store for both consoles, with derived counts and badges (M21, M22, M26, M28, A3, A6, A7, A10)
☐ Use one modal component with dialog role, focus trap and Esc to close, rendered in a portal (M13, A4)
☐ Update colour tokens for contrast, set a 12px minimum text size, and use one table and one toggle style (cross-cutting, M25, A11)
☐ Use one persona per role and separate merchant and platform staff names (M14, A8, A9)
☐ Fix the remaining S2 items in the merchant and admin tables
Pass 3: polish
☐ Fix all S3 items, including copy fixes, browser titles and favicon, mobile density and demo-control cleanup
