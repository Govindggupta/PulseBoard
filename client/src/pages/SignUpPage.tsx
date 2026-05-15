import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { AuthShell } from '../components/auth/AuthShell'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form'
import { Input } from '../components/ui/input'
import { useAuth, type AuthUser } from '../context/AuthContext'
import { api } from '../lib/axios'
import { getApiErrorMessage } from '../lib/errors'

const signupSchema = z
  .object({
    username: z
      .string()
      .min(2, 'At least 2 characters')
      .max(20, 'Use 20 characters or less')
      .regex(/^\S+$/, 'No spaces allowed'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignUpFormValues = z.infer<typeof signupSchema>

export function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: SignUpFormValues) => {
      const response = await api.post('/api/auth/signup', {
        email: values.email,
        username: values.username,
        password: values.password,
      })

      return response.data as {
        message: string
        token: string
        user: AuthUser
      }
    },
    onSuccess: (data) => {
      login(data.token, data.user)
      toast.success('Welcome!')
      navigate('/dashboard')
    },
    onError: (error) => {
      if ((error as { response?: { status?: number } }).response?.status === 409) {
        toast.error('Email already in use')
        return
      }

      toast.error(getApiErrorMessage(error))
    },
  })

  const onSubmit = (values: SignUpFormValues) => {
    mutation.mutate(values)
  }

  return (
    <AuthShell
      description="Create polls, collect responses, and make team decisions easier to explain."
      eyebrow="PulseBoard"
      highlight="Preview"
      title="Create a workspace for clearer feedback."
    >
      <Card className="overflow-hidden rounded-lg border-white/10 bg-card/90 shadow-2xl shadow-black/35 backdrop-blur">
        <CardHeader className="space-y-4 border-b border-white/10 p-6 sm:p-7">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold leading-tight tracking-normal text-zinc-50">
              Create your account
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              Choose a handle, add your email, and lock in your password.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-7">
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-zinc-200">Username</FormLabel>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="username"
                          className="h-11 border-white/10 bg-white/[0.035] pl-10 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-200/40 focus-visible:ring-offset-0"
                          placeholder="govind"
                        />
                      </FormControl>
                    </div>
                    <FormDescription className="text-xs text-zinc-500">2-20 characters, no spaces.</FormDescription>
                    <FormMessage className="text-xs text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-zinc-200">Email address</FormLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="email"
                          className="h-11 border-white/10 bg-white/[0.035] pl-10 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-200/40 focus-visible:ring-offset-0"
                          placeholder="you@company.com"
                          type="email"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-zinc-200">Password</FormLabel>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="new-password"
                          className="h-11 border-white/10 bg-white/[0.035] pl-10 pr-12 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-200/40 focus-visible:ring-offset-0"
                          placeholder="At least 8 characters"
                          type={showPassword ? 'text' : 'password'}
                        />
                      </FormControl>
                      <Button
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-zinc-500 hover:bg-white/5 hover:text-zinc-100"
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage className="text-xs text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-zinc-200">Confirm password</FormLabel>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="new-password"
                          className="h-11 border-white/10 bg-white/[0.035] pl-10 pr-12 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-200/40 focus-visible:ring-offset-0"
                          placeholder="Repeat your password"
                          type={showConfirmPassword ? 'text' : 'password'}
                        />
                      </FormControl>
                      <Button
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-zinc-500 hover:bg-white/5 hover:text-zinc-100"
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() => setShowConfirmPassword((current) => !current)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage className="text-xs text-red-300" />
                  </FormItem>
                )}
              />

              <Button
                className="h-11 w-full bg-zinc-100 font-semibold text-zinc-950 hover:bg-zinc-200"
                disabled={mutation.isPending}
                type="submit"
              >
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {mutation.isPending ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="justify-center border-t border-white/10 p-6 sm:p-7">
          <p className="text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Button asChild className="h-auto px-1 text-zinc-100 hover:bg-transparent hover:text-white" variant="ghost">
              <Link to="/signin">Sign in</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </AuthShell>
  )
}
