# 🧱 Entity Relationship Diagram (ERD)

```
users
-----
id (PK)
email
role ('importer' | 'forwarder')
name
company_name
location
created_at

shipments
---------
id (PK)
user_id (FK -> users.id)
origin_city
destination
delivery_type
cargo_volume
item_type
target_delivery_date
notes
status
created_at

quotes
------
id (PK)
shipment_id (FK -> shipments.id)
forwarder_id (FK -> users.id)
all_in_cost
eta_to_ph
eta_to_door
service_type
notes
status
created_at
```