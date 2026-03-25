import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Github, ArrowRight, Zap, Shield, Rocket, Users, Code, Layers } from 'lucide-react'
import { getSession } from '@/server-fn/get-session'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className='min-h-screen bg-background text-foreground selection:bg-primary/20'>
      {/* ===== Glassy Navbar ===== */}
      <nav className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md'>
        <div className='container flex h-16 items-center justify-between'>
          <div className='flex items-center gap-2 font-bold text-xl tracking-tight'>
            <img src='/logo192.png' alt='BetterDash Logo' className='h-8 w-8 rounded-lg' />
            BetterDash
          </div>
          <div className='hidden md:flex items-center gap-8'>
            <a href='#features' className='text-sm font-medium hover:text-primary transition-colors'>Features</a>
            <a href='#how-it-works' className='text-sm font-medium hover:text-primary transition-colors'>How it Works</a>
            <a href='#community' className='text-sm font-medium hover:text-primary transition-colors'>Community</a>
          </div>
          <div className='flex items-center gap-4'>
            <Link to='/sign-in'>
              <Button variant='ghost' size='sm'>Sign In</Button>
            </Link>
            <Link to='/sign-up'>
              <Button size='sm' className='hidden sm:flex'>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero Section ===== */}
      <section className='relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24'>
        <div className='container relative z-10'>
          <div className='mx-auto max-w-4xl text-center'>
            <div className='inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6 animate-pulse'>
              <Zap size={14} className='mr-2' />
              Version 1.0 is officially open source
            </div>
            <h1 className='text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text'>
              Launch your admin dashboard in <span className='text-primary decoration-primary/30 underline-offset-8'>5 minutes,</span> not 5 days.
            </h1>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl mb-10'>
              The open-source starter kit with Better Auth, TanStack Router, and Prisma. 
              Stop building boilerplate and start building your product.
            </p>
            <div className='flex flex-wrap items-center justify-center gap-4'>
              <Link to='/sign-up'>
                <Button size='lg' className='h-12 px-8 text-base shadow-lg shadow-primary/20'>
                  Get Started for Free <ArrowRight size={18} className='ml-2' />
                </Button>
              </Link>
              <a href='https://github.com/MuhammadNabeelNisarWorkspace/betterdash' target='_blank' rel='noreferrer'>
                <Button variant='outline' size='lg' className='h-12 px-8 text-base glass-card'>
                  <Github size={18} className='mr-2' /> View on GitHub
                </Button>
              </a>
            </div>
            <p className='mt-6 text-sm text-muted-foreground flex items-center justify-center gap-4'>
              <span className='flex items-center gap-1'><Check size={14} className='text-primary' /> No lock-in</span>
              <span className='flex items-center gap-1'><Check size={14} className='text-primary' /> Fully type-safe</span>
              <span className='flex items-center gap-1'><Check size={14} className='text-primary' /> MIT Licensed</span>
            </p>
          </div>

          <div className='mt-16 sm:mt-24 relative'>
             {/* Decorative Blobs */}
             <div className='absolute -top-24 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse'></div>
             <div className='absolute -bottom-24 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-700'></div>
             
             <div className='relative rounded-2xl border border-border/50 bg-background/50 p-2 shadow-2xl backdrop-blur-sm group overflow-hidden'>
                <img 
                  src='https://placehold.co/1200x600/png?text=BetterDash+Preview' 
                  alt='BetterDash Outcome' 
                  className='rounded-xl shadow-inner w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]'
                />
                
                {/* Floating UI Simulation */}
                <div className='absolute top-1/4 -right-8 hidden lg:block'>
                   <div className='glass-card p-4 rounded-xl shadow-xl border border-white/10 animate-bounce'>
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='w-2 h-2 rounded-full bg-green-500'></div>
                        <div className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>Live Metrics</div>
                      </div>
                      <div className='text-xl font-bold'>+20.1%</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ===== Social Proof ===== */}
      <section className='border-y border-border/40 bg-muted/30 py-12'>
        <div className='container'>
          <p className='text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8'>
            Trusted by developers shipping on
          </p>
          <div className='flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all'>
            <code className='text-xl font-bold'>VERCEL</code>
            <code className='text-xl font-bold'>NETLIFY</code>
            <code className='text-xl font-bold'>COOLIFY</code>
            <code className='text-xl font-bold'>SUPABASE</code>
            <code className='text-xl font-bold'>DIGITAL OCEAN</code>
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section id='features' className='py-24 sm:py-32'>
        <div className='container'>
          <div className='mx-auto max-w-2xl text-center mb-16'>
            <h2 className='text-base font-semibold leading-7 text-primary'>Development Velocity</h2>
            <p className='mt-2 text-3xl font-bold tracking-tight sm:text-4xl'>Everything you need to ship today.</p>
            <p className='mt-6 text-lg leading-8 text-muted-foreground'>
              Why spend days setting up the basics? We've done the heavy lifting so you can focus on your business logic.
            </p>
          </div>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3'>
              <FeatureCard 
                icon={<Shield className='text-primary' />}
                title='Secure Authentication'
                description='Powered by Better Auth. Passkeys, 2FA, Social Login, and full session management out of the box.'
              />
              <FeatureCard 
                icon={<Layers className='text-primary' />}
                title='Type-Safe Routing'
                description='TanStack Router handles your routing with end-to-end type safety, search param validation, and layouts.'
              />
              <FeatureCard 
                icon={<Code className='text-primary' />}
                title='Prisma Ready'
                description='Ready-to-use database schema and migrations. Fully typed ORM to keep your data layer clean.'
              />
              <FeatureCard 
                icon={<Users className='text-primary' />}
                title='User Management'
                description='Pre-built tables, filters, and forms for managing users, roles, and permissions effortlessly.'
              />
              <FeatureCard 
                icon={<Zap className='text-primary' />}
                title='Modern Tech Stack'
                description='Vite for speed, Tailwind v4 for styling excellence, and Shadcn UI for beautiful, accessible components.'
              />
              <FeatureCard 
                icon={<Rocket className='text-primary' />}
                title='Production Ready'
                description='From environment variables to build scripts, we have optimized everything for a smooth deployment.'
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className='relative isolate overflow-hidden bg-primary py-24 sm:py-32'>
        <div className='px-6 lg:px-8 container'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
              Stop building boilerplate. <br/>Start building your dream.
            </h2>
            <p className='mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/80'>
              BetterDash is free, open source, and waiting for your next big idea. 
              Join thousands of developers shipping faster.
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
               <Link to='/sign-up'>
                  <Button variant='secondary' size='lg' className='h-12 px-8'>
                    Get Started Now
                  </Button>
               </Link>
               <a href='https://github.com/MuhammadNabeelNisarWorkspace/betterdash' className='text-sm font-semibold leading-6 text-white'>
                View Documentation <span aria-hidden='true'>→</span>
              </a>
            </div>
          </div>
        </div>
        <svg
          viewBox='0 0 1024 1024'
          className='absolute left-1/2 top-1/2 -z-10 h-256 w-5xl -translate-x-1/2 mask-[radial-gradient(closest-side,white,transparent)]'
          aria-hidden='true'
        >
          <circle cx='512' cy='512' r='512' fill='url(#827591b1-ce8c-4110-b064-7cb85a0b1217)' fillOpacity='0.7' />
          <defs>
            <radialGradient id='827591b1-ce8c-4110-b064-7cb85a0b1217'>
              <stop stopColor='#7775D6' />
              <stop offset='1' stopColor='#E935C1' />
            </radialGradient>
          </defs>
        </svg>
      </section>
      
      {/* ===== Footer ===== */}
      <footer className='border-t border-border/40 py-12 bg-muted/10'>
        <div className='container flex flex-col md:flex-row items-center justify-between gap-6'>
          <div className='flex items-center gap-2 font-bold'>
            BetterDash
          </div>
          <p className='text-sm text-muted-foreground'>
            © 2026 BetterDash. Built with passion for the developer community.
          </p>
          <div className='flex items-center gap-4'>
            <a href='#' className='text-muted-foreground hover:text-primary'><Github size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className='glass-card border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5'>
      <CardContent className='pt-6'>
        <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
          {icon}
        </div>
        <h3 className='text-lg font-bold mb-2'>{title}</h3>
        <p className='text-sm text-muted-foreground leading-relaxed'>
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
