---
name: apply-ui-templates
description: Guidelines and instructions on how to copy, customize, and reuse the dashboard and tasks templates located in the ui-template/ directory.
---

# Applying UI Templates (Dashboard & Tasks)

This skill instructs the agent on how to leverage the pre-defined template files in `ui-template/` to construct new pages or features in the Next.js application.

## Available Templates

1. **Dashboard Template** (`ui-template/dashboard/`)
   - Suitable for overview pages, analytical charts, and side-nav structures.
   - Core files:
     - [page.tsx](file:///p:/Nodejs/HomeFridge/ui-template/dashboard/page.tsx): Layout skeleton using `SidebarProvider` and interactive dashboard segments.
     - [components/app-sidebar.tsx](file:///p:/Nodejs/HomeFridge/ui-template/dashboard/components/app-sidebar.tsx): Collapsible navigation panel utilizing `@/components/ui/sidebar`.
     - [components/chart-area-interactive.tsx](file:///p:/Nodejs/HomeFridge/ui-template/dashboard/components/chart-area-interactive.tsx): Interactive recharts component.
     - [components/data-table.tsx](file:///p:/Nodejs/HomeFridge/ui-template/dashboard/components/data-table.tsx): Column-reorderable complex table utilizing dnd-kit.
     - Other helper widgets: [section-cards.tsx](file:///p:/Nodejs/HomeFridge/ui-template/dashboard/components/section-cards.tsx), [site-header.tsx](file:///p:/Nodejs/HomeFridge/ui-template/dashboard/components/site-header.tsx).

2. **Tasks Table Template** (`ui-template/tasks/`)
   - Perfect for lists of tasks, issues, transactions, or any tabular data requiring filtering, pagination, search, and sorting.
   - Core files:
     - [page.tsx](file:///p:/Nodejs/HomeFridge/ui-template/tasks/page.tsx): Asynchronous data fetch wrapper and title block.
     - [components/data-table.tsx](file:///p:/Nodejs/HomeFridge/ui-template/tasks/components/data-table.tsx): Core TanStack Table integration.
     - [components/columns.tsx](file:///p:/Nodejs/HomeFridge/ui-template/tasks/components/columns.tsx): Columns definition, status rendering, and badge/action controls.
     - Control widgets: [data-table-toolbar.tsx](file:///p:/Nodejs/HomeFridge/ui-template/tasks/components/data-table-toolbar.tsx) (search and faceted filters), [data-table-pagination.tsx](file:///p:/Nodejs/HomeFridge/ui-template/tasks/components/data-table-pagination.tsx).

3. **RHF Form Template** (`ui-template/rhf-form/`)
   - Suitable for creating and refactoring forms using React Hook Form, @hookform/resolvers, and Zod.
   - Core files:
     - [SKILL.md](file:///p:/Nodejs/HomeFridge/ui-template/rhf-form/SKILL.md): Explains the form patterns, trigger style, rules, and catalog recipes.
     - [form-rhf-demo.tsx](file:///p:/Nodejs/HomeFridge/ui-template/rhf-form/form-rhf-demo.tsx): Basic form demonstration with text and textarea inputs.
     - [form-rhf-input.tsx](file:///p:/Nodejs/HomeFridge/ui-template/rhf-form/form-rhf-input.tsx), [form-rhf-select.tsx](file:///p:/Nodejs/HomeFridge/ui-template/rhf-form/form-rhf-select.tsx), [form-rhf-checkbox.tsx](file:///p:/Nodejs/HomeFridge/ui-template/rhf-form/form-rhf-checkbox.tsx), [form-rhf-switch.tsx](file:///p:/Nodejs/HomeFridge/ui-template/rhf-form/form-rhf-switch.tsx), [form-rhf-textarea.tsx](file:///p:/Nodejs/HomeFridge/ui-template/rhf-form/form-rhf-textarea.tsx), [form-rhf-radiogroup.tsx](file:///p:/Nodejs/HomeFridge/ui-template/rhf-form/form-rhf-radiogroup.tsx): Isolated templates for specific field types.
     - [form-rhf-array.tsx](file:///p:/Nodejs/HomeFridge/ui-template/rhf-form/form-rhf-array.tsx): Dynamic array fields with `useFieldArray`.
     - [form-rhf-complex.tsx](file:///p:/Nodejs/HomeFridge/ui-template/rhf-form/form-rhf-complex.tsx): Complex form combining multiple control types (Radio, Select, Checkbox group, Switch).
     - [form-rhf-password.tsx](file:///p:/Nodejs/HomeFridge/ui-template/rhf-form/form-rhf-password.tsx): Password form with dynamic strength checking/live feedback.

---

## Workflow for Copying and Customizing a Template

When a user requests a new feature or page that fits one of these templates, you must follow these steps:

### Step 1: Identify Target Directory

Determine the directory inside `app/` where the new page will reside (e.g., `app/admin/reports/` or `app/dashboard/garbage/`).

### Step 2: Copy Files and Restructure

Copy the template files. You can copy the main `page.tsx` and its supporting components.

- If the target page only needs a part of the template (e.g., just the table), copy only the relevant files from `components/` to `app/<target-route>/components/` or a shared `components/` directory.

### Step 3: Resolve Import Path Names

Always rewrite import paths based on the destination:

- Common UI elements must be imported from `@/components/ui/...`
- Core hooks must be imported from `@/hooks/...`
- Utility functions must use `@/lib/...`
- Relative imports (e.g., `./components/user-nav` or `../data/schema`) must be verified and adjusted according to the destination folder structure.

### Step 4: Adapt Data Schema & Logic

Customize the columns, filters, and rendering logic to match the new database schema or APIs:

- For tables: Modify `columns.tsx` to display fields from your Prisma model/API return type instead of the default task fields.
- For charts: Update keys, labels, and colors in `chartConfig` and the Area components in `chart-area-interactive.tsx`.
- For sidebars: Add or remove navigation items in `app-sidebar.tsx`.

### Step 5: Verification

Run a TypeScript check (`npm run typecheck`) and try to build the application (`npm run build`) to ensure there are no compilation errors.
