import React, { useState, useEffect, useRef } from 'react';
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
import ContactSalesDialog from '@/components/ContactSalesDialog';

const LandingPage = () => {
  const { user } = useAuth();
  const [contactSalesOpen, setContactSalesOpen] = useState(false);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-on-scroll');
          entry.target.classList.remove('opacity-0');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all elements with data-animate attribute
    const animateElements = document.querySelectorAll('[data-animate]');
    animateElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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
      <section className="w-full py-12 md:py-20 lg:py-32">
        <div className="flex items-center justify-center min-h-[50vh] lg:min-h-[60vh]">
          <div className="text-center w-full px-4 lg:px-8">
            <div className="flex justify-center mb-6 lg:mb-8 animate-fade-in">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm lg:text-base">
                <Brain className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                AI-Powered Security
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 lg:mb-10 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight animate-scale-in">
              Corporate Insider
              <br />
              Threat Detection
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-muted-foreground mb-8 lg:mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              GenSentinel uses advanced AI and machine learning to monitor employee activities, 
              detect suspicious behavior, and prevent insider threats in real-time with explainable intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center mb-12 lg:mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="min-w-[200px] lg:min-w-[240px] text-base lg:text-lg h-12 lg:h-14">
                    <LayoutDashboard className="h-5 w-5 lg:h-6 lg:w-6 mr-2" />
                    Access Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/organization-signup">
                  <Button size="lg" className="min-w-[200px] lg:min-w-[240px] text-base lg:text-lg h-12 lg:h-14">
                    <Building2 className="h-5 w-5 lg:h-6 lg:w-6 mr-2" />
                    Get Started
                  </Button>
                </Link>
              )}
              <Button 
                size="lg" 
                variant="outline" 
                className="min-w-[200px] lg:min-w-[240px] text-base lg:text-lg h-12 lg:h-14"
                onClick={() => setContactSalesOpen(true)}
              >
                <Globe className="h-5 w-5 lg:h-6 lg:w-6 mr-2" />
                Contact Sales
              </Button>
            </div>

            {/* Key Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="p-4 lg:p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Zap className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-base lg:text-xl font-bold mb-2">Real-Time Detection</h3>
                <p className="text-sm lg:text-base text-muted-foreground">
                  Identify threats instantly with &lt;1ms latency for immediate response
                </p>
              </div>

              <div className="p-4 lg:p-6 bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg border hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-2 bg-accent/10 rounded-full">
                    <Brain className="h-6 w-6 lg:h-8 lg:w-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-base lg:text-xl font-bold mb-2">Explainable AI</h3>
                <p className="text-sm lg:text-base text-muted-foreground">
                  Understand every alert with transparent AI explanations
                </p>
              </div>

              <div className="p-4 lg:p-6 bg-gradient-to-br from-success/5 to-info/5 rounded-lg border hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-2 bg-success/10 rounded-full">
                    <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-success" />
                  </div>
                </div>
                <h3 className="text-base lg:text-xl font-bold mb-2">24/7 Protection</h3>
                <p className="text-sm lg:text-base text-muted-foreground">
                  Continuous monitoring with 99.9% uptime guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-16 lg:py-24">
        <div className="w-full px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center opacity-0" data-animate style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex justify-center mb-4 lg:mb-6">
                  <div className="p-3 lg:p-4 bg-primary/10 rounded-full">
                    <stat.icon className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
                  </div>
                </div>
                <div className="text-3xl lg:text-5xl xl:text-6xl font-bold text-primary mb-2 lg:mb-3">{stat.number}</div>
                <div className="text-sm lg:text-base xl:text-lg text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 md:py-20 lg:py-32 bg-muted/30">
        <div className="w-full px-4 lg:px-8">
          <div className="text-center mb-12 lg:mb-20 opacity-0" data-animate>
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 mb-6 text-sm lg:text-base">
              <Brain className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              How It Works
            </Badge>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6">
              Intelligent Threat Detection Process
            </h2>
            <p className="text-lg lg:text-xl xl:text-2xl text-muted-foreground">
              Our AI-powered platform continuously monitors, analyzes, and protects your organization from insider threats through a sophisticated multi-layered approach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <Card className="relative overflow-hidden border-2 hover:border-primary transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Eye className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
                  </div>
                  <Badge className="text-2xl font-bold">01</Badge>
                </div>
                <CardTitle className="text-xl lg:text-2xl">Monitor</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base lg:text-lg">
                  Continuous surveillance of all user activities, document access, system interactions, and communication patterns across your entire organization in real-time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Brain className="h-6 w-6 lg:h-8 lg:w-8 text-accent" />
                  </div>
                  <Badge className="text-2xl font-bold">02</Badge>
                </div>
                <CardTitle className="text-xl lg:text-2xl">Analyze</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base lg:text-lg">
                  Advanced machine learning algorithms process behavioral patterns, detect anomalies, and identify potential security risks using sophisticated AI models trained on millions of data points.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-destructive/10 rounded-full">
                    <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-destructive" />
                  </div>
                  <Badge className="text-2xl font-bold">03</Badge>
                </div>
                <CardTitle className="text-xl lg:text-2xl">Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base lg:text-lg">
                  Instant notifications to security teams with detailed threat assessments, risk scores, and explainable AI insights that clarify why specific actions were flagged as suspicious.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-success/10 rounded-full">
                    <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-success" />
                  </div>
                  <Badge className="text-2xl font-bold">04</Badge>
                </div>
                <CardTitle className="text-xl lg:text-2xl">Protect</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base lg:text-lg">
                  Automated response protocols and manual intervention tools enable swift action to prevent data breaches, secure sensitive information, and maintain complete audit trails for compliance.
                </CardDescription>
              </CardContent>
            </Card>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-20 lg:py-32">
        <div className="w-full px-4 lg:px-8">
          <div className="text-center mb-12 lg:mb-20 opacity-0" data-animate>
            <Badge className="bg-accent/10 text-accent border-accent/20 px-4 py-2 mb-6 text-sm lg:text-base">
              <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Enterprise Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6">
            Complete Security Solution
          </h2>
            <p className="text-lg lg:text-xl xl:text-2xl text-muted-foreground">
            Comprehensive tools and features designed for enterprise-level security management and threat prevention.
          </p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 opacity-0" data-animate style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="pb-4 lg:pb-6">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className={`p-2 lg:p-3 rounded-lg bg-primary/10`}>
                      <feature.icon className={`h-6 w-6 lg:h-8 lg:w-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg lg:text-xl xl:text-2xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base lg:text-lg leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="w-full py-16 md:py-20 lg:py-32 bg-muted/30">
        <div className="w-full px-4 lg:px-8">
          <div className="text-center mb-12 lg:mb-20 opacity-0" data-animate>
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 mb-6 text-sm lg:text-base">
              <Building2 className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Use Cases
            </Badge>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6">
              Protecting Organizations Across Industries
            </h2>
            <p className="text-lg lg:text-xl xl:text-2xl text-muted-foreground">
              GenSentinel adapts to your unique security needs, providing tailored protection for diverse enterprise environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 hover:shadow-xl transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-primary rounded-lg">
                    <Building2 className="h-6 w-6 lg:h-8 lg:w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl lg:text-3xl">Financial Services</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base lg:text-lg leading-relaxed">
                  Protect sensitive financial data, customer information, and transaction records from unauthorized access. Monitor trading activities, prevent fraud, and ensure regulatory compliance with comprehensive audit trails and real-time threat detection for banking and investment firms.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-2 hover:shadow-xl transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-accent rounded-lg">
                    <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-2xl lg:text-3xl">Healthcare</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base lg:text-lg leading-relaxed">
                  Safeguard patient medical records, research data, and personal health information. Ensure HIPAA compliance while monitoring access to electronic health records, detecting unauthorized data exports, and protecting against insider threats in hospitals, clinics, and research facilities.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/5 to-info/5 border-2 hover:shadow-xl transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-success rounded-lg">
                    <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-success-foreground" />
                  </div>
                  <CardTitle className="text-2xl lg:text-3xl">Technology & SaaS</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base lg:text-lg leading-relaxed">
                  Protect intellectual property, source code, and proprietary algorithms from theft or unauthorized sharing. Monitor developer activities, track code repository access, prevent data exfiltration, and secure your competitive advantage in the fast-paced tech industry.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/5 to-destructive/5 border-2 hover:shadow-xl transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-warning rounded-lg">
                    <Lock className="h-6 w-6 lg:h-8 lg:w-8 text-warning-foreground" />
                  </div>
                  <CardTitle className="text-2xl lg:text-3xl">Government & Defense</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base lg:text-lg leading-relaxed">
                  Protect classified information, sensitive documents, and national security data with military-grade security measures. Monitor clearance levels, detect anomalous access patterns, maintain chain of custody, and ensure complete compliance with government security standards.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full py-16 md:py-20 lg:py-32">
        <div className="w-full px-4 lg:px-8">
          <div className="text-center mb-12 lg:mb-20 opacity-0" data-animate>
            <Badge className="bg-accent/10 text-accent border-accent/20 px-4 py-2 mb-6 text-sm lg:text-base">
              <Zap className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Why Choose GenSentinel
            </Badge>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6">
              Industry-Leading Security Platform
            </h2>
            <p className="text-lg lg:text-xl xl:text-2xl text-muted-foreground">
              Built by security experts for security professionals, trusted by enterprises worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="p-6 lg:p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border-2 hover:shadow-lg transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-8 w-8 lg:h-10 lg:w-10 text-success" />
                <h3 className="text-xl lg:text-2xl font-bold">Explainable AI</h3>
              </div>
              <p className="text-base lg:text-lg text-muted-foreground">
                Unlike black-box AI systems, GenSentinel provides clear, understandable explanations for every threat detection, empowering your security team to make informed decisions quickly and confidently.
              </p>
            </div>

            <div className="p-6 lg:p-8 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border-2 hover:shadow-lg transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-8 w-8 lg:h-10 lg:w-10 text-warning" />
                <h3 className="text-xl lg:text-2xl font-bold">Real-Time Detection</h3>
              </div>
              <p className="text-base lg:text-lg text-muted-foreground">
                With sub-millisecond detection latency, GenSentinel identifies threats the moment they occur, allowing your team to respond instantly before damage is done, minimizing risk and protecting assets.
              </p>
            </div>

            <div className="p-6 lg:p-8 bg-gradient-to-br from-success/10 to-info/10 rounded-lg border-2 hover:shadow-lg transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-8 w-8 lg:h-10 lg:w-10 text-info" />
                <h3 className="text-xl lg:text-2xl font-bold">Enterprise Scale</h3>
              </div>
              <p className="text-base lg:text-lg text-muted-foreground">
                Built to handle organizations of any size, from startups to Fortune 500 companies. Our platform scales seamlessly to monitor thousands of users across multiple departments and locations worldwide.
              </p>
            </div>

            <div className="p-6 lg:p-8 bg-gradient-to-br from-info/10 to-success/10 rounded-lg border-2 hover:shadow-lg transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
                <h3 className="text-xl lg:text-2xl font-bold">Compliance Ready</h3>
              </div>
              <p className="text-base lg:text-lg text-muted-foreground">
                Meet regulatory requirements with built-in compliance features for GDPR, HIPAA, SOC 2, ISO 27001, and more. Complete audit trails and automated reporting simplify compliance management.
              </p>
            </div>

            <div className="p-6 lg:p-8 bg-gradient-to-br from-warning/10 to-destructive/10 rounded-lg border-2 hover:shadow-lg transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 lg:h-10 lg:w-10 text-accent" />
                <h3 className="text-xl lg:text-2xl font-bold">Easy Deployment</h3>
              </div>
              <p className="text-base lg:text-lg text-muted-foreground">
                Get up and running in hours, not weeks. Our intuitive interface, comprehensive documentation, and dedicated support team ensure smooth implementation with minimal disruption to operations.
              </p>
            </div>

            <div className="p-6 lg:p-8 bg-gradient-to-br from-destructive/10 to-warning/10 rounded-lg border-2 hover:shadow-lg transition-all duration-300 opacity-0" data-animate style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-8 w-8 lg:h-10 lg:w-10 text-success" />
                <h3 className="text-xl lg:text-2xl font-bold">Actionable Insights</h3>
              </div>
              <p className="text-base lg:text-lg text-muted-foreground">
                Transform raw security data into strategic intelligence. Our advanced analytics dashboards provide deep insights into user behavior, risk trends, and security posture improvements over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-20 lg:py-32">
        <div className="w-full px-4 lg:px-8">
        <Card className="bg-gradient-to-r from-primary to-accent text-white border-0">
            <CardContent className="p-8 lg:p-16 xl:p-20 text-center">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6">
              Ready to Secure Your Organization?
            </h2>
              <p className="text-lg lg:text-xl xl:text-2xl mb-8 lg:mb-12 text-primary-foreground/90">
              Join hundreds of enterprises worldwide who trust GenSentinel to protect their most valuable assets and prevent insider threats.
            </p>
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center">
              {user ? (
                <Link to="/dashboard">
                    <Button size="lg" variant="secondary" className="min-w-[200px] lg:min-w-[240px] text-base lg:text-lg h-12 lg:h-14">
                      <Shield className="h-5 w-5 lg:h-6 lg:w-6 mr-2" />
                    Access Your Portal
                  </Button>
                </Link>
              ) : (
                <Link to="/organization-signup">
                    <Button size="lg" variant="secondary" className="min-w-[200px] lg:min-w-[240px] text-base lg:text-lg h-12 lg:h-14">
                      <Building2 className="h-5 w-5 lg:h-6 lg:w-6 mr-2" />
                    Get Started
                  </Button>
                </Link>
              )}
              <Button 
                size="lg" 
                variant="outline" 
                  className="min-w-[200px] lg:min-w-[240px] text-base lg:text-lg h-12 lg:h-14 border-white text-black hover:bg-white/10"
                onClick={() => setContactSalesOpen(true)}
              >
                  <Building2 className="h-5 w-5 lg:h-6 lg:w-6 mr-2" />
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm">
        <div className="w-full px-4 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary rounded-lg">
                  <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg lg:text-xl">GenSentinel</h3>
                  <p className="text-xs lg:text-sm text-muted-foreground">Security Platform</p>
                </div>
              </div>
              <p className="text-sm lg:text-base text-muted-foreground">
                Advanced AI-powered insider threat detection for enterprise security.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-base lg:text-lg">Product</h4>
              <ul className="space-y-2 text-sm lg:text-base text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-base lg:text-lg">Company</h4>
              <ul className="space-y-2 text-sm lg:text-base text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-base lg:text-lg">Support</h4>
              <ul className="space-y-2 text-sm lg:text-base text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 lg:mt-12 pt-8 text-center text-sm lg:text-base text-muted-foreground">
            <p>© 2024 GenSentinel. All rights reserved. Enterprise Security Platform.</p>
          </div>
        </div>
      </footer>

      {/* Contact Sales Dialog */}
      <ContactSalesDialog open={contactSalesOpen} onOpenChange={setContactSalesOpen} />
    </div>
  );
};

export default LandingPage;