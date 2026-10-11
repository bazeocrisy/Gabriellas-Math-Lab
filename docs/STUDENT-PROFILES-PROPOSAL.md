# Proposal: separate local student profiles

**Status:** proposal for owner review. **Not implemented.** NumberNova currently keeps **one** set of progress per browser. It does not separate students, and the app does not claim that it does.

## Why

NumberNova is meant for more than one child. Today, two children using the same browser would share one progress record, so their Test results, mastery and practice would mix.

## Constraints

- No accounts, passwords, servers, databases or cloud sync.
- Progress stays on the device.
- Existing progress must survive unchanged.
- Profiles hold a first name or nickname only, chosen by the family. No other personal information.

## Proposed data model (localStorage)

| Key | Contents |
|---|---|
| `gml:v1:profiles` | `{ "active": "p1", "list": [{ "id": "p1", "name": "Student 1", "created": "2026-10-11T..." }] }` |
| `gml:v1:p:<id>:progress` | That student's lesson progress: the same shape as today's `gml:v1:progress`. |
| `gml:v1:p:<id>:draft:<name>` | That student's drafts: Teach steps and checks, lesson Practice and Test drafts, the Practice Center session and the Practice Center history. |

- **Storage module.** All reads and writes already go through `js/storage.js` (`G.store`). That module would add the prefix `gml:v1:p:<active>:`, so the Teach, Practice, Test, Practice Center and Parent Progress code would not need to change.
- **Choosing a student.** A small "Who is learning?" chooser in the header: a list of names plus "Add student". Switching asks for confirmation if a Test or Practice session is open.
- **Parent Progress.** Shows the active student by name, with a menu to view each student in turn. Students' scores are never combined.
- **Erasing progress.** Offers "this student" or "all students".

## Migration (one time, no data loss)

1. On first load after the update, if `gml:v1:profiles` is missing but `gml:v1:progress` or any `gml:v1:draft:*` exists, create profile `p1`. Name it "Student 1" (the family can rename it).
2. Copy each existing key to its `gml:v1:p:p1:` equivalent. Verify every copy by reading it back.
3. Only after that, remove the old keys. If anything fails, keep the old keys and keep using them; nothing is lost.
4. A browser with no saved data starts with no profiles. The first visit asks for a name, or the family can skip and use "Student 1".

## Risks and tests needed

- **Migration.** Test it with progress saved by every earlier version: the original build, `79abadc`, and the audit corrections. Include drafts that are in progress, and storage that is blocked or full.
- **Open work during a switch.** Switching students while a Test or Practice Center session is open must not move it to the other student.
- **Integrity checks.** The tab checks (attempt ids, storage events) must use the profile-prefixed keys.
- **Limits.** Profiles are not secure. Any child can open another child's profile on the same browser. This is a convenience, not privacy protection, and Parent Progress should say so.

## Decision needed

Approve or adjust this model before it is built. It is out of scope for the NumberNova redesign branch.
