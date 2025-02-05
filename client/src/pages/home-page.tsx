import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, insertTaskSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useState } from "react";
import {
  Check,
  LogOut,
  Plus,
  Trash2,
  ArrowUpDown,
  Loader2,
  ClipboardList,
  Flag,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type SortKey = "createdAt" | "completed" | "priority";

const COLORS = {
  default: "bg-card",
  red: "bg-red-50 dark:bg-red-950",
  yellow: "bg-yellow-50 dark:bg-yellow-950",
  green: "bg-green-50 dark:bg-green-950",
  blue: "bg-blue-50 dark:bg-blue-950",
  purple: "bg-purple-50 dark:bg-purple-950",
} as const;

const PRIORITIES = [
  { value: 0, label: "Нет", icon: null },
  { value: 1, label: "Низкий", color: "text-blue-500" },
  { value: 2, label: "Средний", color: "text-yellow-500" },
  { value: 3, label: "Высокий", color: "text-red-500" },
] as const;

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Задача создана", variant: "default" });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      const res = await apiRequest("PATCH", `/api/tasks/${task.id}`, {
        completed: !task.completed,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Задача удалена" });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      color: "default",
      priority: 0,
      description: "",
    },
  });

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortKey === "completed") {
      return Number(a.completed) - Number(b.completed);
    } else if (sortKey === "priority") {
      return b.priority - a.priority;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Привет, {user?.username}
            </h1>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => logoutMutation.mutate()}
            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                createTaskMutation.mutate(data);
                form.reset();
              })}
              className="space-y-4 p-6 bg-card rounded-lg border shadow-lg"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название задачи</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Введите название задачи..."
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цвет</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите цвет" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="default">По умолчанию</SelectItem>
                          <SelectItem value="red">Красный</SelectItem>
                          <SelectItem value="yellow">Желтый</SelectItem>
                          <SelectItem value="green">Зеленый</SelectItem>
                          <SelectItem value="blue">Синий</SelectItem>
                          <SelectItem value="purple">Фиолетовый</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Приоритет</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите приоритет" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITIES.map((priority) => (
                            <SelectItem
                              key={priority.value}
                              value={priority.value.toString()}
                            >
                              <span className="flex items-center gap-2">
                                {priority.value > 0 && (
                                  <Flag className={`w-4 h-4 ${priority.color}`} />
                                )}
                                {priority.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Добавьте описание задачи..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={createTaskMutation.isPending}
                className="w-full gap-2"
                size="lg"
              >
                <Plus className="w-5 h-5" />
                Добавить задачу
              </Button>
            </form>
          </Form>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Ваши задачи</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSortKey(key => {
                    if (key === "completed") return "priority";
                    if (key === "priority") return "createdAt";
                    return "completed";
                  })
                }
                className="text-muted-foreground hover:text-primary"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Сортировать по{" "}
                {sortKey === "completed" 
                  ? "приоритету" 
                  : sortKey === "priority" 
                    ? "дате" 
                    : "статусу"}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.ul 
                className="space-y-3"
                layout
              >
                {sortedTasks.map((task) => (
                  <motion.li
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-all ${COLORS[task.color as keyof typeof COLORS]}`}
                  >
                    <div className="flex items-start gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 mt-1"
                        onClick={() => toggleTaskMutation.mutate(task)}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.completed
                              ? "bg-primary border-primary"
                              : "border-primary/50 hover:border-primary"
                          }`}
                        >
                          {task.completed && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                      </Button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium transition-all ${
                            task.completed 
                              ? "line-through text-muted-foreground" 
                              : "text-foreground"
                          }`}>
                            {task.title}
                          </h3>
                          {task.priority > 0 && (
                            <Flag className={`w-4 h-4 ${PRIORITIES[task.priority].color}`} />
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(task.createdAt), "d MMMM yyyy")}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTaskMutation.mutate(task.id)}
                        className="shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          )}

          {!isLoading && sortedTasks.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-muted-foreground">Нет задач</h3>
              <p className="text-sm text-muted-foreground">
                Добавьте свою первую задачу, используя форму выше
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}