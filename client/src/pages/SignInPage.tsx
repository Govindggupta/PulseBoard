import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { AuthShell } from '../components/auth/AuthShell'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form'
import { Input } from '../components/ui/input'
import { useSignIn } from '../hooks'

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormValues = z.infer<typeof signinSchema>

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const mutation = useSignIn()

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values: SignInFormValues) => {
    mutation.mutate(values)
  }

  return (
    <AuthShell
      description="Review active polls, compare response trends, and share clear results with your team."
      eyebrow="PulseBoard"
      highlight="Preview"
      title="Continue tracking the feedback that matters."
    >
      <Card className="overflow-hidden rounded-lg border-white/10 bg-card/90 shadow-2xl shadow-black/35 backdrop-blur">
        <CardHeader className="space-y-4 border-b border-white/10 p-6 sm:p-7">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold leading-tight tracking-normal text-zinc-50">
              Sign in to PulseBoard
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              Use your workspace email to continue.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-7">
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
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
                          autoComplete="current-password"
                          className="h-11 border-white/10 bg-white/[0.035] pl-10 pr-12 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-200/40 focus-visible:ring-offset-0"
                          placeholder="Enter your password"
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

              <Button
                className="h-11 w-full bg-zinc-100 font-semibold text-zinc-950 hover:bg-zinc-200"
                disabled={mutation.isPending}
                type="submit"
              >
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {mutation.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="justify-center border-t border-white/10 p-6 sm:p-7">
          <p className="text-center text-sm text-zinc-400">
            New to PulseBoard?{' '}
            <Button asChild className="h-auto px-1 text-zinc-100 hover:bg-transparent hover:text-white" variant="ghost">
              <Link to="/signup">Create an account</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </AuthShell>
  )
}
