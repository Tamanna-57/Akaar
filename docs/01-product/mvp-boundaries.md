# MVP boundaries

Straight from §9 of the source prompt, with the interdependence obligations made
explicit.

## MUST BUILD

**Seller** — profile · Hindi voice input · photo capture · STT · structured
extraction · image cleanup/background removal · Hindi+English catalog · seller
approval · material and labour cost input · explainable floor and
recommendation · catalog list · local drafts and upload retry

**Buyer** — search and filters · RFQ/inquiry · viewing seller responses

**Shared** — auth and roles · inquiry thread · basic cluster/admin approval ·
basic analytics · Terms of Service · Privacy Policy

**Interdependence obligations inside MUST** — these are the parts that are
invisible if either half is built alone, and they are not optional:

- Capability block (`moq`, `capacity_per_cycle`, `cycle_days`, `lead_time_days`)
  required before publication.
- Buyer filters implement the matching contract, not a keyword search.
- Price floor enforced server-side on quotations.
- Role-parameterised serialisation — no `SELLER_PRIVATE` field in a buyer
  payload.
- Language bridge on inquiry messages, both directions, with audio.

## SHOULD BUILD

One additional regional language · craft knowledge graph · QR story ·
scored buyer matching · voice playback everywhere · before/after image
comparison · simulated ONDC-style export · scam warnings

## MOCK / FUTURE — and labelled as such in the product

Live GeM / IndiaHandmade / ONDC publishing · real payment settlement · full
logistics · demand forecasting · blockchain certificates · automated dynamic
repricing · consumer cart and review ecosystem

`MarketplaceExport.is_simulated` defaults to `true` in the schema, so "simulated"
is a data fact rather than a caption someone can forget to render.

## Cut lines, in order

If time runs short, cut in this order. The list is ordered so the demo narrative
survives as long as possible.

1. AI lifestyle backgrounds
2. Business Assistant
3. QR story
4. Second regional language
5. Cluster manager mode → reduce to admin approval only
6. Scored ranking → filters only, ordered by lead time

**Never cut:** the price floor, the original-image guarantee, human approval
gates, the capability block, or the Terms/Privacy documents. Each of those is
load-bearing for a claim the product makes about itself.
