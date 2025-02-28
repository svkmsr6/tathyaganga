import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/hooks/use-translations";
import { 
  Layout, 
  FileText, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ReactNode;
}

export default function SidebarNav() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [open, setOpen] = useState(false);
  const { t } = useTranslations();

  const navItems: NavItem[] = [
    {
      titleKey: "nav.dashboard",
      href: "/",
      icon: <Layout className="h-4 w-4" />,
    },
    {
      titleKey: "nav.newContent",
      href: "/editor",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      titleKey: "nav.settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b z-50">
      <div className="container h-full mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full py-4">
                <div className="flex items-center gap-2 px-4 py-2">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f"
                    alt={t('common.logo')}
                    className="h-8 w-8 rounded"
                  />
                  <h1 className="text-lg font-bold">{t('common.appName')}</h1>
                </div>
                <ScrollArea className="flex-1 px-2">
                  <div className="space-y-1 py-2">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={location === item.href ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setOpen(false)}
                        >
                          {item.icon}
                          <span className="ml-2">{t(item.titleKey)}</span>
                        </Button>
                      </Link>
                    ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={() => logoutMutation.mutate()}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('nav.logout')}
                    </Button>
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f"
            alt={t('common.logo')}
            className="h-8 w-8 rounded"
          />
          <h1 className="text-lg font-bold">{t('common.appName')}</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn(
                  location === item.href && "bg-accent"
                )}
              >
                {item.icon}
                <span className="ml-2">{t(item.titleKey)}</span>
              </Button>
            </Link>
          ))}
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('nav.logout')}
          </Button>
        </nav>
      </div>
    </header>
  );
}