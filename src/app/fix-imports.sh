#!/bin/bash
# Script to remove version numbers from imports in all UI components

echo "Fixing versioned imports in UI components..."

# Fix dialog
sed -i 's/@radix-ui\/react-dialog@[0-9.]*/@radix-ui\/react-dialog/g' components/ui/dialog.tsx
sed -i 's/lucide-react@[0-9.]*/ lucide-react/g' components/ui/dialog.tsx

# Fix drawer
sed -i 's/vaul@[0-9.]*/vaul/g' components/ui/drawer.tsx

# Fix dropdown-menu
sed -i 's/@radix-ui\/react-dropdown-menu@[0-9.]*/@radix-ui\/react-dropdown-menu/g' components/ui/dropdown-menu.tsx
sed -i 's/lucide-react@[0-9.]*/lucide-react/g' components/ui/dropdown-menu.tsx

# Fix form
sed -i 's/@radix-ui\/react-label@[0-9.]*/@radix-ui\/react-label/g' components/ui/form.tsx
sed -i 's/@radix-ui\/react-slot@[0-9.]*/@radix-ui\/react-slot/g' components/ui/form.tsx

# Fix hover-card
sed -i 's/@radix-ui\/react-hover-card@[0-9.]*/@radix-ui\/react-hover-card/g' components/ui/hover-card.tsx

# Fix input-otp
sed -i 's/lucide-react@[0-9.]*/lucide-react/g' components/ui/input-otp.tsx

# Fix label
sed -i 's/@radix-ui\/react-label@[0-9.]*/@radix-ui\/react-label/g' components/ui/label.tsx

# Fix menubar
sed -i 's/@radix-ui\/react-menubar@[0-9.]*/@radix-ui\/react-menubar/g' components/ui/menubar.tsx
sed -i 's/lucide-react@[0-9.]*/lucide-react/g' components/ui/menubar.tsx

# Fix navigation-menu
sed -i 's/@radix-ui\/react-navigation-menu@[0-9.]*/@radix-ui\/react-navigation-menu/g' components/ui/navigation-menu.tsx
sed -i 's/class-variance-authority@[0-9.]*/class-variance-authority/g' components/ui/navigation-menu.tsx
sed -i 's/lucide-react@[0-9.]*/lucide-react/g' components/ui/navigation-menu.tsx

# Fix pagination
sed -i 's/lucide-react@[0-9.]*/lucide-react/g' components/ui/pagination.tsx

# Fix popover
sed -i 's/@radix-ui\/react-popover@[0-9.]*/@radix-ui\/react-popover/g' components/ui/popover.tsx

# Fix progress
sed -i 's/@radix-ui\/react-progress@[0-9.]*/@radix-ui\/react-progress/g' components/ui/progress.tsx

# Fix radio-group
sed -i 's/@radix-ui\/react-radio-group@[0-9.]*/@radix-ui\/react-radio-group/g' components/ui/radio-group.tsx
sed -i 's/lucide-react@[0-9.]*/lucide-react/g' components/ui/radio-group.tsx

# Fix resizable
sed -i 's/lucide-react@[0-9.]*/lucide-react/g' components/ui/resizable.tsx

# Fix scroll-area
sed -i 's/@radix-ui\/react-scroll-area@[0-9.]*/@radix-ui\/react-scroll-area/g' components/ui/scroll-area.tsx

# Fix select
sed -i 's/@radix-ui\/react-select@[0-9.]*/@radix-ui\/react-select/g' components/ui/select.tsx
sed -i 's/lucide-react@[0-9.]*/lucide-react/g' components/ui/select.tsx

# Fix separator
sed -i 's/@radix-ui\/react-separator@[0-9.]*/@radix-ui\/react-separator/g' components/ui/separator.tsx

# Fix sheet
sed -i 's/@radix-ui\/react-dialog@[0-9.]*/@radix-ui\/react-dialog/g' components/ui/sheet.tsx
sed -i 's/lucide-react@[0-9.]*/lucide-react/g' components/ui/sheet.tsx

# Fix sidebar
sed -i 's/@radix-ui\/react-slot@[0-9.]*/@radix-ui\/react-slot/g' components/ui/sidebar.tsx
sed -i 's/class-variance-authority@[0-9.]*/class-variance-authority/g' components/ui/sidebar.tsx
sed -i 's/lucide-react@[0-9.]*/lucide-react/g' components/ui/sidebar.tsx

# Fix slider
sed -i 's/@radix-ui\/react-slider@[0-9.]*/@radix-ui\/react-slider/g' components/ui/slider.tsx

# Fix switch
sed -i 's/@radix-ui\/react-switch@[0-9.]*/@radix-ui\/react-switch/g' components/ui/switch.tsx

# Fix tabs
sed -i 's/@radix-ui\/react-tabs@[0-9.]*/@radix-ui\/react-tabs/g' components/ui/tabs.tsx

# Fix toggle-group
sed -i 's/@radix-ui\/react-toggle-group@[0-9.]*/@radix-ui\/react-toggle-group/g' components/ui/toggle-group.tsx
sed -i 's/class-variance-authority@[0-9.]*/class-variance-authority/g' components/ui/toggle-group.tsx

# Fix toggle
sed -i 's/@radix-ui\/react-toggle@[0-9.]*/@radix-ui\/react-toggle/g' components/ui/toggle.tsx
sed -i 's/class-variance-authority@[0-9.]*/class-variance-authority/g' components/ui/toggle.tsx

# Fix tooltip
sed -i 's/@radix-ui\/react-tooltip@[0-9.]*/@radix-ui\/react-tooltip/g' components/ui/tooltip.tsx

echo "Done! All versioned imports have been fixed."
