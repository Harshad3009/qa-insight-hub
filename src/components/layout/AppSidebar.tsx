import {
    LayoutDashboard,
    History,
    Upload,
    Settings,
    Bug,
    TrendingUp,
    LogOut,
    User as UserIcon,
    ChevronsUpDown
} from 'lucide-react';
import {NavLink, useLocation} from 'react-router-dom';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
} from '@/components/ui/sidebar';
import {ProjectSwitcher} from "./ProjectSwitcher";
import {useAuth} from "@/contexts/AuthContext.tsx";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";

const mainNavItems = [
    {title: 'Dashboard', url: '/', icon: LayoutDashboard},
    {title: 'Test Runs', url: '/runs', icon: History},
];

const analyticsItems = [
    {title: 'Trends', url: '/trends', icon: TrendingUp},
    {title: 'Flaky Tests', url: '/flaky', icon: Bug},
];

export function AppSidebar() {
    const location = useLocation();
    const {user, logout} = useAuth();

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <Sidebar className="border-r border-sidebar-border">
            <SidebarHeader className="p-6 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Bug className="w-5 h-5 text-primary-foreground"/>
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">QA Intelligence</h1>
                        <p className="text-xs text-muted-foreground">Dashboard v2.0</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Main
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLink
                                            to={item.url}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                                isActive(item.url)
                                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5"/>
                                            <span className="font-medium">{item.title}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-6">
                    <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Analytics
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {analyticsItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLink
                                            to={item.url}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                                isActive(item.url)
                                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5"/>
                                            <span className="font-medium">{item.title}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-sidebar-border">
                <ProjectSwitcher/>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div
                                        className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                        <UserIcon className="size-4"/>
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.username}</span>
                                        <span className="truncate text-xs">{user?.role}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4"/>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.username}</span>
                                            <span
                                                className="truncate text-xs capitalize">{user?.role?.toLowerCase()}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4"/>
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
                {/*    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer">*/}
                <NavLink
                    to={"/settings"}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive("/settings")
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                >
                    <Settings className="w-5 h-5"/>
                    <span className="font-medium">Settings</span>
                </NavLink>
            </SidebarFooter>
        </Sidebar>
    );
}
