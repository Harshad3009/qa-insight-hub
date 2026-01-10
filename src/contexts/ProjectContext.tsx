import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, getProjects } from '@/services/api';
import { toast } from 'sonner';
import {AxiosError} from "axios";

interface ProjectContextType {
    projects: Project[];
    currentProject: Project | null;
    setCurrentProject: (project: Project) => void;
    isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const data = await getProjects();
                setProjects(data);

                // Logic to restore selection or default to first
                const savedProjectId = localStorage.getItem('lastProjectId');
                const found = data.find(p => p.id.toString() === savedProjectId);

                if (found) {
                    setCurrentProject(found);
                } else if (data.length > 0) {
                    setCurrentProject(data[0]);
                }
            } catch (error) {
                if (error instanceof AxiosError && error.status==403) {
                    console.error("Forbidden to fetch projects", error);
                    toast.error("No valid user logged in. Please login to fetch your projects.");
                    return;
                }
                console.error("Failed to load projects", error);
                toast.error("Failed to load projects. Ensure backend is running.");
            } finally {
                setIsLoading(false);
            }
        };

        loadProjects();
    }, []);

    const handleSetProject = (project: Project) => {
        setCurrentProject(project);
        localStorage.setItem('lastProjectId', project.id.toString());
        // Optional: Force a window reload if your app relies heavily on strict isolation
        // window.location.reload();

        toast.info(`Switched to ${project.name}`);
    };

    return (
        <ProjectContext.Provider value={{
        projects,
            currentProject,
            setCurrentProject: handleSetProject,
            isLoading
    }}>
    {children}
    </ProjectContext.Provider>
);
}

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};