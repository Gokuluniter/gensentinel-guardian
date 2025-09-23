import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Eye,
  Brain,
  Lock,
  Users,
  BarChart3,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Building2,
  Zap,
  Globe,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Threat Detection',
      description: 'Advanced machine learning algorithms monitor user behavior and detect suspicious activities in real-time.',
      color: 'text-accent',
    },
    {
      icon: Eye,
      title: 'Explainable AI (XAI)',
      description: 'Transparent explanations for every threat detection, helping users understand why actions were flagged.',
      color: 'text-primary',
    },
    {
      icon: Shield,
      title: 'Real-time Monitoring',
      description: 'Continuous surveillance of corporate activities with instant alerts for security breaches.',
      color: 'text-success',
    },
    {
      icon: Lock,
      title: 'Access Control',
      description: 'Multi-level authentication and authorization system with role-based permissions.',
      color: 'text-warning',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Comprehensive dashboards and detailed reports for security insights and compliance.',
      color: 'text-info',
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Complete employee lifecycle management with department-based access controls.',
      color: 'text-destructive',
    },
  ];

  const stats = [
    { number: '99.9%', label: 'Uptime Guarantee', icon: Zap },
    { number: '< 1ms', label: 'Detection Latency', icon: Eye },
    { number: '500+', label: 'Enterprise Clients', icon: Building2 },
    { number: '24/7', label: 'Security Monitoring', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-corporate-light/20 to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  GenSentinel
                </h1>
                <p className="text-xs text-muted-foreground">Corporate Security Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button>
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button>
                    Access Portal
                    <Lock className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Brain className="h-4 w-4 mr-2" />
              AI-Powered Security
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
            Corporate Insider
            <br />
            Threat Detection
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            GenSentinel uses advanced AI and machine learning to monitor employee activities, 
            detect suspicious behavior, and prevent insider threats in real-time with explainable intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="min-w-[200px]">
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Access Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="min-w-[200px]">
                  <Lock className="h-5 w-5 mr-2" />
                  Secure Login
                </Button>
              </Link>
            )}
            <Button size="lg" variant="outline" className="min-w-[200px]">
              <Globe className="h-5 w-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="bg-accent/10 text-accent border-accent/20 px-4 py-2 mb-6">
            <CheckCircle className="h-4 w-4 mr-2" />
            Enterprise Features
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Complete Security Solution
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools and features designed for enterprise-level security management and threat prevention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-primary/10`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary to-accent text-white border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Secure Your Organization?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Join hundreds of enterprises worldwide who trust GenSentinel to protect their most valuable assets and prevent insider threats.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary" className="min-w-[200px]">
                    <Shield className="h-5 w-5 mr-2" />
                    Access Your Portal
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="min-w-[200px]">
                    <Lock className="h-5 w-5 mr-2" />
                    Get Started
                  </Button>
                </Link>
              )}
              <Button size="lg" variant="outline" className="min-w-[200px] border-white text-black hover:bg-white/10">
                <Building2 className="h-5 w-5 mr-2" />
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary rounded-lg">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">GenSentinel</h3>
                  <p className="text-xs text-muted-foreground">Security Platform</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced AI-powered insider threat detection for enterprise security.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Security</a></li>
                <li><a href="#" className="hover:text-foreground">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Status</a></li>
                <li><a href="#" className="hover:text-foreground">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 GenSentinel. All rights reserved. Enterprise Security Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;