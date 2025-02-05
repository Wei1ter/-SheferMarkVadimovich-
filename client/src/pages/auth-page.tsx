import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, CheckCircle2, ListTodo } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background to-muted/20">
      <div className="flex-1 flex items-center justify-center p-4">
        <Tabs defaultValue="login" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <AuthCard
              title="С возвращением"
              description="Войдите в свой аккаунт, чтобы продолжить"
              onSubmit={(data) => loginMutation.mutate(data)}
              isLoading={loginMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="register">
            <AuthCard
              title="Создать аккаунт"
              description="Зарегистрируйтесь, чтобы начать"
              onSubmit={(data) => registerMutation.mutate(data)}
              isLoading={registerMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-8">
        <div className="max-w-md space-y-8 text-center text-primary-foreground">
          <div className="space-y-2">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-4xl font-bold bg-clip-text">
              Управление задачами
            </h1>
            <p className="text-lg opacity-90">
              Оставайтесь организованными и повышайте свою продуктивность с нашим интуитивно понятным решением для управления задачами.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <Feature
              icon={CheckCircle2}
              title="Простое отслеживание"
              description="Легко отмечайте выполненные задачи и следите за прогрессом"
            />
            <Feature
              icon={ListTodo}
              title="Умная сортировка"
              description="Сортируйте задачи по дате создания или статусу выполнения"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="rounded-lg bg-primary-foreground/10 p-2">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </div>
  );
}

function AuthCard({
  title,
  description,
  onSubmit,
  isLoading,
}: {
  title: string;
  description: string;
  onSubmit: (data: InsertUser) => void;
  isLoading: boolean;
}) {
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя пользователя</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Подождите..." : title}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}