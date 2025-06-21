"use client"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import UserInformation from "./user_information"

export function SignIn() {
    const [currentView, setCurrentView] = useState<'signin' | 'login' | 'register' | 'userinfo'>('signin')
    const [userName, setuserName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // useEffect(() => {
        // Check for Google auth success on page load
    //     const urlParams = new URLSearchParams(window.location.search)
    //     if (urlParams.get('google_auth') === 'success') {
    //         const userEmail = urlParams.get('user_email')
    //         const userName = urlParams.get('user_name')
            
    //         // Store user data and redirect to user info
    //         if (userEmail && userName) {
    //             localStorage.setItem('google_user', JSON.stringify({ email: userEmail, name: userName }))
    //             setCurrentView('userinfo')
                
    //             // Clean up URL
    //             window.history.replaceState({}, document.title, window.location.pathname)
    //         }
    //     }
        
    //     if (urlParams.get('error')) {
    //         setError('Authentication failed. Please try again.')
    //     }
    // }, [])

    const handleLoginClick = () => {
        setCurrentView('login')
    }

    const handleRegisterClick = () => {
        setCurrentView('register')
    }

    // const handleGoogleAuth = async () => {
    //     setIsLoading(true)
    //     setError('')
        
    //     // Redirect to Google OAuth
    //     window.location.href = '/api/auth/google'
    // }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            if (response.ok) {
                setCurrentView('userinfo')
            } else {
                const errorData = await response.json()
                setError(errorData.message || 'Login failed')
            }
        } catch (error) {
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName, email, password }),
            })

            if (response.ok) {
                setCurrentView('userinfo')
            } else {
                const errorData = await response.json()
                setError(errorData.message || 'Registration failed')
            }
        } catch (error) {
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (currentView === 'userinfo') {
        return <UserInformation />
    }

    if (currentView === 'signin') {
        return (
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>
                        <div className="flex justify-center text-xl">
                            Welcome
                        </div>
                    </CardTitle>
                    <CardDescription className="text-center">
                        Get started with your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <Button onClick={handleLoginClick} className="w-full">
                            Login
                        </Button>
                        <Button onClick={handleRegisterClick} variant="outline" className="w-full">
                            Create Account
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Connecting...' : 'Continue with Google'}
                        </Button>
                        {error && (
                            <div className="text-sm text-red-600 text-center">
                                {error}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (currentView === 'login') {
        return (
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>
                        <div className="flex justify-center text-xl">
                            Login
                        </div>
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>
                            {error && (
                                <div className="text-sm text-red-600 text-center">
                                    {error}
                                </div>
                            )}
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button 
                        type="submit" 
                        className="w-full"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setCurrentView('signin')}
                        disabled={isLoading}
                    >
                        Back
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center h-screen z-10">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>
                        <div className="flex justify-center text-xl">
                            Create Account
                        </div>
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your details to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateAccount}>
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="userName">Username</Label>
                                <Input
                                    id="userName"
                                    type="text"
                                    placeholder="yoyo_honey_singh"
                                    value={userName}
                                    onChange={(e) => setuserName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Create Password</Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input 
                                    id="confirmPassword" 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required 
                                />
                            </div>
                            {error && (
                                <div className="text-sm text-red-600 text-center">
                                    {error}
                                </div>
                            )}
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button 
                        type="submit" 
                        className="w-full"
                        onClick={handleCreateAccount}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setCurrentView('signin')}
                        disabled={isLoading}
                    >
                        Back
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
