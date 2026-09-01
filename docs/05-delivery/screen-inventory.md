# Screen inventory

`◆` MVP · `○` should-build · `·` future
Module in brackets.

## Onboarding — `:feature:onboarding`
◆ Splash · ◆ Language select · ◆ Role select · ◆ Phone entry · ◆ OTP verify ·
◆ Consent · ◆ Terms of Service · ◆ Privacy Policy

## Seller — `:feature:seller`

**Profile** ◆ Name · ◆ Region · ◆ Craft picker · ◆ Capacity · ◆ Cluster link ·
◆ Profile view/edit · ○ Packaging & sample policy

**Home** ◆ Seller home (attention list) · ◆ Analytics summary

**Create** ◆ Entry · ◆ Camera capture · ◆ Quality feedback · ◆ Photo review ·
◆ Voice record · ◆ Voice review/replay · ◆ Processing · ◆ Transcript review ·
◆ Attribute review · ◆ Missing-field questions · ◆ Cost input ·
◆ Price breakdown · ◆ Capability input · ◆ Image studio ·
○ Before/after compare · · Lifestyle background · ◆ Listing review (hi/en) ·
◆ Approval confirm · ◆ Published

**Products** ◆ List · ◆ Detail · ◆ Edit · ◆ Pause/archive confirm ·
◆ Draft resume · ○ Export sheet · ○ QR story

**Inquiries** ◆ List · ◆ Thread · ◆ Quotation builder · ◆ Quotation review ·
◆ Below-floor warning · ◆ Order intent confirm · ○ RFQ invitations

**Assistant** ○ Business Assistant

## Buyer — `:feature:buyer` *(provisional)*
◆ Buyer profile setup · ◆ Discover · ◆ Search · ◆ Filters · ◆ Results ·
◆ Product detail · ◆ Image compare · ◆ Artisan profile · ◆ RFQ create ·
◆ RFQ list · ◆ RFQ matches · ◆ Inquiry list · ◆ Thread ·
◆ Quotation view/respond · ◆ Order intent confirm · ○ Saved searches

## Cluster — `:feature:cluster`
◆ Queue · ◆ Product review · ◆ Approve/reject · ○ Artisan list ·
○ Assisted onboarding

## Shared — `:feature:shared`
◆ Inquiry thread (both roles) · ◆ Message composer (voice + text) ·
◆ Translation toggle · ◆ Audio playback · ◆ Media viewer · ◆ Notifications ·
◆ Settings · ◆ Language switch · ◆ Consent management · ◆ Delete account

## Counts

| | MVP | Should | Future |
|---|---|---|---|
| Onboarding | 8 | — | — |
| Seller | 30 | 5 | 1 |
| Buyer | 15 | 1 | — |
| Cluster | 3 | 2 | — |
| Shared | 10 | — | — |
| **Total** | **66** | **8** | **1** |

Every one of the 66 needs all six states (`design-system.md`). That is the real
number, and it is the argument for the state scaffolds being components rather
than per-screen work.
