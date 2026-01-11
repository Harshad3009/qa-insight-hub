import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { login } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Mail, ShieldCheck, Terminal, User } from 'lucide-react';
import { toast } from 'sonner';
import {AxiosError} from "axios";

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await login({ username, password });
            authLogin(data.token, { username: data.username, role: data.role });
            toast.success(`Welcome back, ${data.username}! Happy testing!!!`);
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Login failed:', error.response?.data || error.message);
                toast.error(error.response?.data || error.message);
                return;
            }
            toast.error('Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen grid lg:grid-cols-2">

            {/* Left Side: Thematic Background */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 text-white p-10 relative overflow-hidden">
                {/* Abstract Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent"></div>

                <div className="relative z-10 flex items-center gap-2 font-medium text-xl">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    QA Insights Hub
                </div>

                <div className="relative z-10 max-w-lg">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Quality is not an act, it is a habit. This platform gives us the visibility we need to turn automation results into actionable insights.&rdquo;
                        </p>
                        <footer className="text-sm text-zinc-400">Software Engineering Team</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Terminal className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Enter your credentials to access your testing dashboard
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        placeholder="Enter your username"
                                        className="pl-10 h-11"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <a href="#" className="text-sm font-medium text-primary hover:text-primary/90">
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-11"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button className="w-full h-11 text-base" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Don't have an account? </span>
                            <a href="#" className="font-medium text-primary hover:text-primary/90">
                                Contact Admin
                            </a>
                        </div>
                    </form>

                    {/* Demo Credentials Helper */}
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Demo Accounts
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium text-foreground">Manager</p>
                                <p className="text-muted-foreground">manager / password</p>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Engineer</p>
                                <p className="text-muted-foreground">dev / password</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}