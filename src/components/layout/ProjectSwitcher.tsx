import { ChevronsUpDown, FolderGit2, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useProject } from "@/contexts/ProjectContext";

export function ProjectSwitcher() {
    const { isMobile } = useSidebar();
    const { projects, currentProject, setCurrentProject, isLoading } = useProject();

    if (isLoading) {
        return <div className="h-12 animate-pulse bg-sidebar-accent/10 rounded-md m-2" />;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <FolderGit2 className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentProject?.name || "Select Project"}
                </span>
                                <span className="truncate text-xs">
                  {currentProject ? "Active" : "No Project"}
                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Projects
                        </DropdownMenuLabel>
                        {projects.map((project) => (
                            <DropdownMenuItem
                                key={project.name}
                                onClick={() => setCurrentProject(project)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <FolderGit2 className="size-4 shrink-0" />
                                </div>
                                {project.name}
                                {/* Visual indicator for active project */}
                                {currentProject?.id === project.id && (
                                    <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2" disabled>
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Plus className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">Add Project</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}