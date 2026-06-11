# User Roles

Status: current repo inspection

Source: current repo inspection.

Current role enum in the database:

- `importer`
- `forwarder`
- `admin`

## Importer

- creates onboarding profile
- creates and views own shipment requests
- reviews quote counts and private quote activity
- participates in quote-gated conversations

## Forwarder

- belongs to a forwarder company through `forwarder_members`
- browses and quotes shipment requests
- participates in quote-gated conversations
- may be suspended at company level from quoting activity

## Admin

- views marketplace overview for users, requests, quotes, and forwarder companies
- suspends or restores forwarder companies through admin actions

## Forwarder Member Roles

Current enum:

- `owner`
- `admin`
- `member`
