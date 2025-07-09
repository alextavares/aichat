-- Manual upgrade script for user cmcwfirhs0004ohrt0nl0bmha
-- Payment ID: 117508146189

-- Step 1: Update user plan to PRO
UPDATE "User" 
SET "planType" = 'PRO', "updatedAt" = NOW()
WHERE "id" = 'cmcwfirhs0004ohrt0nl0bmha';

-- Step 2: Create subscription record
INSERT INTO "Subscription" (
    "id", "userId", "planType", "status", "mercadoPagoPaymentId", 
    "startedAt", "expiresAt", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'cmcwfirhs0004ohrt0nl0bmha',
    'PRO',
    'ACTIVE',
    '117508146189',
    NOW(),
    NOW() + INTERVAL '1 month',
    NOW(),
    NOW()
);

-- Step 3: Create payment record
INSERT INTO "Payment" (
    "id", "userId", "amount", "currency", "status", "mercadoPagoPaymentId",
    "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'cmcwfirhs0004ohrt0nl0bmha',
    99.90,
    'BRL',
    'COMPLETED',
    '117508146189',
    NOW(),
    NOW()
);

-- Step 4: Verify the results
SELECT 
    'User Plan' as type,
    "planType" as value,
    "updatedAt"
FROM "User" 
WHERE "id" = 'cmcwfirhs0004ohrt0nl0bmha';

SELECT 
    'Subscription' as type,
    "status" || ' - expires: ' || "expiresAt" as value,
    "createdAt"
FROM "Subscription" 
WHERE "userId" = 'cmcwfirhs0004ohrt0nl0bmha' 
ORDER BY "createdAt" DESC 
LIMIT 1;

SELECT 
    'Payment' as type,
    "status" || ' - R$ ' || "amount" as value,
    "createdAt"
FROM "Payment" 
WHERE "userId" = 'cmcwfirhs0004ohrt0nl0bmha'
ORDER BY "createdAt" DESC 
LIMIT 1;