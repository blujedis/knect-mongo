# Changes

List of changes for Knect-Mongo

## 10/06/2020

- add findId() method.

## 10/02/2020

- Add .findIncluded() in document to find non-soft deleted records.
- Add excludeKey and excludeValue for soft deletes in main options.

## 07/25/2020

- Add .exclude() in Document for soft deletes. 
- Add .exclude() in Model for soft deletes.
- Update hooks to support exclude.

## 10/08/2019

- Refactor Document.ts
- Move document.ts to own file. 
- Create model.ts prepare for allowing base model to be allowed to be passed as an option in a future release.