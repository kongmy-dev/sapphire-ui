# Migrating to v5

This is an unpublished breaking candidate. Run `bun run migrate <app> --check`
before applying literal migrations. Review its manual reports and the choices below.

## Layout and navigation

Let AdminLayout own navigation. Its default is expanded on desktop and closed on
mobile; no caller state is needed for this behavior.

```tsx
<AdminLayout
  defaultDesktopState="compact"
  sidebar={
    <AdminSidebar brand={({ compact }) => compact ? <Mark /> : <Wordmark />}>
      <AdminSidebarSection title="Workspace">
        <AdminSidebarLink href="/projects" icon={<Folder />} active>
          Projects
        </AdminSidebarLink>
      </AdminSidebarSection>
    </AdminSidebar>
  }
>
  <PageHeader title="Projects" actions={<Button>New project</Button>} />
</AdminLayout>
```

Import the components and their CSS subpaths, or the full stylesheet. A custom
AdminHeader includes the navigation trigger. For a completely custom header,
include AdminSidebarTrigger. Remove `sidebarCollapsed` from AdminLayout and
`collapsed` from Sidebar, Section and Link; replace AdminSidebar.onToggleCollapse
with AdminLayout.onDesktopStateChange. Controlled desktopState accepts
`expanded | compact`. mobileOpen/onMobileOpenChange control the separate drawer.
Supplying only a callback observes local state without taking control.
Derive navigation props with `ComponentProps<typeof AdminSidebarLink>` (and
likewise Section or Group); their separate Props type reexports are removed.

Use one-level AdminSidebarGroup for child links. Keep brand/account content
usable in compact mode through their render functions. Iconless links retain
two visible lines. Routing, persistence and shortcuts belong to the application;
registry Sidebar no longer installs cookies or a global shortcut.

## Forms and tables

Direct FormField inputs continue to work. When hint and error are both supplied,
both remain visible and contribute to the control's accessible description;
update tests that previously expected only the error. Compound controls use a
render child:

```tsx
<FormField label="Status" hint="Choose the next stage." required>
  {({ controlProps, required }) => (
    <Select required={required}>
      <SelectTrigger {...controlProps}><SelectValue /></SelectTrigger>
      <SelectContent>{options}</SelectContent>
    </Select>
  )}
</FormField>
```

Put controlProps on the actual focusable trigger, and required on the control's
root. FormSection supplies a native fieldset and legend. The registry DataTable
accepts a real TanStack Table 9 instance, caller-owned filters and explicit
loading/error/empty content. It adds sorting, visibility and pagination controls;
your application owns data fetching and filter state.

## Appearance and distribution

- `--primary` and `--primary-foreground` form an action pair. Replace permanent
  navy uses with `--brand-navy` and `--on-dark`; this decision is deliberately manual.
- Use `data-typography="editorial"` for the former fluid serif headings.
  Product titles are 28/18/16px. Existing document typography remains explicit.
- Replace Button premium/on-dark-primary with brand, and on-dark-outline with
  outline inside a dark theme scope. The literal migrator handles JSX variant
  values; review custom CSS selectors and dynamic expressions manually.
- Remove Card wrappers around Stat. StatGroup now supplies layout only.
- AdminLayout no longer ships document title/icon, passphrase preview, row-action
  icon-button or search-wrapper styles. Those were demo content, now scoped to
  example CSS. Compose Input, IconMark, Badge and labeled Button actions with
  application content.
- Point registry installs at `/r/v5/{name}.json` when this candidate is released.
  Package subpaths remain explicit; there is no root barrel or new runtime dependency.
