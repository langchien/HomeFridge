-- CreateTable
CREATE TABLE "MenuPlan" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mealTime" "MealTime" NOT NULL,
    "status" "MenuStatus" NOT NULL DEFAULT 'PLANNED',
    "note" TEXT,
    "recipeId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MenuPlan" ADD CONSTRAINT "MenuPlan_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuPlan" ADD CONSTRAINT "MenuPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
