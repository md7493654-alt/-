# Kena Kata Security Specification

## 1. Data Invariants
- A Product must have a status. By default, it's 'pending'.
- Only 'approved' products are visible to public/buyers.
- Users can only edit their own products.
- Only admins/moderators can change product status to 'approved'.
- Messages can only be read/written by participants of the conversation.
- A user can only see their own private fields (NID, idPhotoURL).

## 2. The Dirty Dozen Payloads
1. Create product with `status: 'approved'` as a regular user. (DENIED)
2. Create user with `role: 'admin'`. (DENIED - role set via server or admin manual)
3. Update another user's `isVerified` status. (DENIED)
4. Read `nid` of another user. (DENIED)
5. Post message to a conversation I'm not in. (DENIED)
6. Delete a product I didn't create. (DENIED)
7. Inject 2MB string into product description. (DENIED - size limit)
8. Update product `price` to a negative number. (DENIED)
9. Change `sellerId` of an existing product. (DENIED)
10. Read messages of a conversation I'm not in. (DENIED)
11. Update `createdAt` field on product. (DENIED - immutable)
12. Create a product with a non-existent sellerId. (DENIED)

## 3. The Test Runner
(Will be implemented in `firestore.rules.test.ts` if needed, but for now I'll proceed to rules.)
