import { useWebSocket, TestRunEvent } from '@/hooks/use-web-socket';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RealTimeListener() {
    const navigate = useNavigate();

    const handleEvent = (event: TestRunEvent) => {
        // Determine Icon and Color based on health
        const isHealthy = event.status === 'Healthy';
        const Icon = isHealthy ? CheckCircle2 : AlertCircle;
        const colorClass = isHealthy ? 'text-green-500' : 'text-red-500';

        toast.custom((t) => (
            <div className="bg-background border border-border rounded-lg shadow-lg p-4 w-[350px] pointer-events-auto flex items-start gap-4 animate-in slide-in-from-right-5">
                <div className={`mt-1 p-1.5 rounded-full bg-secondary ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-sm">
                        {event.type === 'NEW_RUN' ? 'New Test Run' : 'Run Updated'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Project: <span className="font-medium text-foreground">{event.projectName}</span>
                    </p>
                    <div className="flex gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1">
              Run #{event.runId}
            </span>
                        <span className={`font-medium ${colorClass}`}>
              {event.failCount} Failures
            </span>
                    </div>

                    <button
                        onClick={() => {
                            navigate(`/runs/${event.runId}`);
                            toast.dismiss(t);
                        }}
                        className="mt-3 text-xs font-medium text-primary hover:underline flex items-center gap-1"
                    >
                        View Details
                    </button>
                </div>

                <button
                    onClick={() => toast.dismiss(t)}
                    className="text-muted-foreground hover:text-foreground"
                >
                    ✕
                </button>
            </div>
        ), { duration: 8000 });
    };

    // Attach listener
    useWebSocket(handleEvent);

    return null; // This component renders nothing itself, just handles logic
}