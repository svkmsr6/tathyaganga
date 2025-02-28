import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Content } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, File, AlertCircle, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { stripHtml, truncateText } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/use-translations";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();

  const { data: contents, isLoading } = useQuery<Content[]>({
    queryKey: ["/api/contents"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
      toast({
        title: t('common.success'),
        description: t('dashboard.deleteSuccess'),
      });
    },
  });

  return (
    <div className="min-h-screen pt-16">
      <main className="p-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-center mb-4">
            {t('dashboard.welcome', { username: user?.username })}
          </h1>
          <Link href="/editor">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('nav.newContent')}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !contents?.length ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <File className="h-12 w-12 mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">{t('dashboard.noContent')}</h2>
              <p className="text-muted-foreground mb-4">
                {t('dashboard.createFirstContent')}
              </p>
              <Link href="/editor">
                <Button>{t('dashboard.createContent')}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {contents.map((content) => (
              <Card key={content.id} className="group relative hover:bg-accent/50 transition-colors">
                <div className="absolute top-2 right-2 z-10">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('dashboard.deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('dashboard.deleteConfirm', { title: content.title })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(content.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            t('common.delete')
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Link href={`/editor/${content.id}`}>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{content.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {truncateText(stripHtml(content.content))}
                    </p>
                    {content.factCheckScore !== null && (
                      <div className="flex items-center mt-4 gap-1 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {t('dashboard.factCheckScore', { score: content.factCheckScore })}
                      </div>
                    )}
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}