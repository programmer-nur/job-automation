# Frontend Setup Plan

## 1. Scaffold Next.js 16 + TypeScript + Tailwind

```
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

## 2. Dependencies

| Package | Purpose |
|---------|---------|
| shadcn/ui (npx init) | Base component primitives |
| hugeicons-react | All icons (no Lucide) |
| next-themes | Dark/light mode |
| clsx + tailwind-merge | cn() utility |
| react-hook-form + @hookform/resolvers + zod | Form system |
| @tanstack/react-table | Data table foundation |

## 3. Design System — Tailwind Config

- Extended color tokens: `primary`, `secondary`, `accent`, `surface`, `muted`, `border`
- fontSize scale: 6 steps (xs → 4xl)
- borderRadius: sm, md, lg, xl, full
- Extended animation: fade-in, slide-up, scale-in
- CSS variables in globals.css for theme switching

## 4. Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/       login, register
│   │   ├── (dashboard)/  main app layout (sidebar + header)
│   │   └── api/           API routes (BFF layer)
│   ├── components/
│   │   ├── app/           Shared primitives
│   │   │   ├── AppText.tsx
│   │   │   ├── AppButton.tsx
│   │   │   ├── AppModal.tsx
│   │   │   ├── AppIcon.tsx
│   │   │   ├── Div.tsx
│   │   │   ├── AppBadge.tsx
│   │   │   ├── AppInput.tsx
│   │   │   ├── AppSelect.tsx
│   │   │   ├── AppCard.tsx
│   │   │   ├── AppAvatar.tsx
│   │   │   ├── AppSpinner.tsx
│   │   │   └── index.ts
│   │   ├── data-table/
│   │   │   ├── DataTable.tsx
│   │   │   ├── DataTableToolbar.tsx
│   │   │   ├── DataTablePagination.tsx
│   │   │   └── index.ts
│   │   ├── form/
│   │   │   ├── FormField.tsx
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   ├── FormTextarea.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── PageContainer.tsx
│   │   └── ui/             shadcn primitives (generated)
│   ├── hooks/
│   ├── lib/
│   │   ├── utils.ts        cn(), formatters
│   │   └── api-client.ts   API base client
│   ├── store/              Redux Toolkit (auth, UI)
│   └── types/
│       ├── api.ts          API response types
│       └── common.ts       Shared frontend types
```

## 5. Shared Components — Design

### AppText
```tsx
<AppText variant="h1">Page Title</AppText>
<AppText variant="body" color="muted">Description</AppText>
<AppText variant="small" as="span">Caption</AppText>
```
Variants: h1, h2, h3, body, small, caption, label
Props: variant, color, as, weight, align, truncate, className, children

### AppButton
```tsx
<AppButton variant="primary">Save</AppButton>
<AppButton variant="ghost" size="sm">Cancel</AppButton>
<AppButton loading>Processing...</AppButton>
```
Wraps shadcn Button. Variants: primary, secondary, outline, ghost, danger
Sizes: sm, md, lg. Props: loading, icon, iconLeft, iconRight

### AppModal
```tsx
<AppModal open={isOpen} onClose={handleClose} title="Confirm">
  <p>Are you sure?</p>
  <AppButton onClick={handleConfirm}>Yes</AppButton>
</AppModal>
```
Wraps shadcn Dialog. Props: open, onClose, title, description, size (sm/md/lg/full)

### AppIcon
```tsx
<AppIcon name="AiHome01" size="md" color="primary" />
<AppIcon name="AiSearch01" className="text-muted" />
```
HugeIcons wrapper. Props: name, size (xs/sm/md/lg/xl), color, className
Autocomplete icons from hugeicons-react

### Div
```tsx
<Div flex between center>
  <AppText>Left</AppText>
  <AppText>Right</AppText>
</Div>
```
Layout utility. Props: flex, between, center, col, gap, p, m, className

### DataTable
```tsx
<DataTable columns={columns} data={jobs} />
<DataTableToolbar searchKey="title" filters={filters} />
<DataTablePagination />
```
Built on @tanstack/react-table. Server/client pagination. Sortable. Selectable.

### Form
```tsx
<FormField name="email" label="Email">
  <FormInput placeholder="you@example.com" />
</FormField>
```
Built on react-hook-form + Zod. Consistent error display. Label + description.

## 6. Theme System

```
next-themes <ThemeProvider>
  ├── light: CSS variables (white bg, dark text)
  └── dark: CSS variables (dark bg, light text)
```

ThemeToggle in header. Respects system preference. Persists to localStorage.
All components use `dark:` Tailwind variants.

## 7. Implementation Order

1. Scaffold + install dependencies
2. shadcn/ui init + configure
3. Tailwind config (tokens, colors, animation)
4. globals.css (CSS variables, theme)
5. ThemeProvider + layout wrapper
6. cn() utility
7. AppIcon → AppText → AppButton → Div → AppBadge → AppSpinner
8. AppModal → AppCard → AppAvatar → AppInput → AppSelect
9. Form components
10. DataTable components
11. Layout components (Sidebar, Header, ThemeToggle, PageContainer)
12. API client + Redux store
13. Auth pages
14. Feature pages (jobs, applications, etc.)
