import { useState, useEffect } from 'react';
import {
    Plus, Copy, Trash2, Key, Check, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectKeys, generateApiKey, revokeApiKey, ApiKey } from '@/services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function ApiKeysTab() {
    const { currentProject } = useProject();
    const { user } = useAuth();
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [newKeyName, setNewKeyName] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // Permission Check
    const canManageKeys = user?.role === 'MANAGER' || user?.role === 'ADMIN';

    useEffect(() => {
        if (currentProject && canManageKeys) {
            fetchKeys();
        } else {
            setLoading(false);
        }
    }, [currentProject, canManageKeys]);

    const fetchKeys = async () => {
        if (!currentProject) return;
        try {
            const data = await getProjectKeys(currentProject.id);
            setKeys(data);
        } catch (error) {
            toast.error('Failed to fetch API keys');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!currentProject || !newKeyName.trim()) return;
        setIsCreating(true);
        try {
            await generateApiKey(currentProject.id, newKeyName);
            toast.success('API Key generated successfully');
            setNewKeyName('');
            setIsDialogOpen(false);
            fetchKeys();
        } catch (error) {
            toast.error('Failed to generate key');
        } finally {
            setIsCreating(false);
        }
    };

    const handleRevoke = async (id: number) => {
        try {
            await revokeApiKey(id);
            toast.success('API Key revoked');
            fetchKeys();
        } catch (error) {
            toast.error('Failed to revoke key');
        }
    };

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success('Secret key copied to clipboard');
    };

    if (!canManageKeys) {
        return (
            <Card>
                <CardContent className="pt-6 text-center py-12">
                    <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Access Denied</h3>
                    <p className="text-muted-foreground">
                        Only Managers can manage API Keys for this project.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                        Manage access tokens for CI/CD integration ({currentProject?.name})
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Generate New Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Generate API Key</DialogTitle>
                            <DialogDescription>
                                Create a new key for a specific tool or pipeline (e.g., "Jenkins Android").
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Input
                                placeholder="Key Name (e.g. GitHub Actions)"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleGenerate} disabled={!newKeyName.trim() || isCreating}>
                                {isCreating ? 'Generating...' : 'Generate Key'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-24 flex items-center justify-center">Loading...</div>
                ) : keys.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        No API keys found. Generate one to integrate with your CI pipeline.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Secret Key</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keys.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Key className="w-4 h-4 text-muted-foreground" />
                                            {key.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                                                {key.secretKey.substring(0, 8)}...
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => copyToClipboard(key.secretKey, key.id)}
                                            >
                                                {copiedId === key.id ? (
                                                    <Check className="w-3 h-3 text-green-500" />
                                                ) : (
                                                    <Copy className="w-3 h-3" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(key.createdAt), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {key.lastUsedAt ? format(new Date(key.lastUsedAt), 'MMM d, HH:mm') : 'Never'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRevoke(key.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}