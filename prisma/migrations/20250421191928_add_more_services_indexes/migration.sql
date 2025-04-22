-- CreateIndex
CREATE INDEX "idx_services_title" ON "services"("title");

-- CreateIndex
CREATE INDEX "idx_services_title_en" ON "services"("title_en");

-- CreateIndex
CREATE INDEX "idx_services_sub_sub_category_created_at" ON "services"("sub_sub_category_id", "created_at");
