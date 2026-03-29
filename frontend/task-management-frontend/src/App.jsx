import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  createTask,
  deleteTaskRequest,
  fetchAssignableUsers,
  fetchTaskStatistics,
  fetchTasks,
  loginRequest,
  logoutRequest,
  sendRegistrationOtp,
  updateTask,
  verifyRegistrationOtp,
} from "./api/taskflowApi";
import LoginForm from "./components/LoginForm";
import LogoutButton from "./components/LogoutButton";
import "./App.css";

const emptyTaskForm = {
  title: "",
  description: "",
  priority: "medium",
  due_date: "",
  assignee: "",
};

const navItems = [
  { path: "/", label: "Home", icon: DashboardIcon },
  { path: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { path: "/board", label: "Task Board", icon: BoardIcon },
  { path: "/tasks", label: "New Task", icon: PlusIcon },
  { path: "/calendar", label: "Calendar", icon: CalendarIcon },
  { path: "/team", label: "Team", icon: TeamIcon },
  { path: "/analytics", label: "Analytics", icon: ChartIcon },
];

const homeShowcaseColumns = [
  {
    title: "To Do",
    count: 12,
    tone: "rose",
    tasks: [
      { label: "Setup API sync", priority: "High", due: "Sep 18, 2026" },
      { label: "Draft landing copy", priority: "Low", due: "Sep 19, 2026" },
    ],
  },
  {
    title: "In Progress",
    count: 8,
    tone: "green",
    tasks: [{ label: "Design auth flow", priority: "Live", due: "Sep 20, 2026" }],
  },
  {
    title: "In Review",
    count: 4,
    tone: "gold",
    tasks: [{ label: "Dashboard metrics", priority: "Review", due: "Sep 20, 2026" }],
  },
  {
    title: "Completed",
    count: 10,
    tone: "lime",
    tasks: [{ label: "Role-based access", priority: "Done", due: "Sep 16, 2026" }],
  },
];

const homeFeatureCards = [
  {
    title: "Intuitive TMS",
    copy: "Create, assign, and track work with clean workflows that fit growing teams.",
    icon: PlusIcon,
  },
  {
    title: "Team Collaboration",
    copy: "Keep comments, ownership, and status changes visible in one shared workspace.",
    icon: TeamIcon,
  },
  {
    title: "Deadline Tracking",
    copy: "Stay ahead of due dates with clear priorities, reminders, and real-time progress.",
    icon: CalendarIcon,
  },
];

const homeRoleCards = [
  {
    title: "Admins",
    copy: "Oversee users, create and manage tasks, and access all workspace reports and controls.",
    icon: CheckBadgeIcon,
  },
  {
    title: "Managers",
    copy: "Create tasks, monitor progress, and review team analytics to keep projects moving.",
    icon: ChartIcon,
  },
  {
    title: "Employees",
    copy: "See your own tasks, update completion status, and stay aligned every day.",
    icon: BoardIcon,
  },
];

const roleLabels = {
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
};

const roleRouteAccess = {
  admin: ["/dashboard", "/board", "/tasks", "/calendar", "/team", "/analytics"],
  manager: ["/dashboard", "/board", "/tasks", "/calendar", "/team", "/analytics"],
  employee: ["/dashboard", "/board", "/calendar"],
};

function getUserRole(user) {
  return user?.role || "employee";
}

const homeFaqItems = [
  {
    question: "Who can access CherruTech?",
    answer:
      "CherruTech is built for admins, managers, and employees. Each role gets the right view to plan, update, and follow work clearly.",
  },
  {
    question: "How do I log in for the first time?",
    answer:
      "Create your account from the home page, verify the OTP sent to your email, then sign in with your username and password.",
  },
  {
    question: "Can I see only my tasks?",
    answer:
      "Yes. The dashboard and task board can focus on your assigned work while still letting managers review the wider project picture.",
  },
  {
    question: "How do I update task progress?",
    answer:
      "Open the dashboard or board, edit the task, and save your changes. Progress updates sync with the backend so the latest status stays visible.",
  },
  {
    question: "Why get notifications for updates?",
    answer:
      "Notifications help your team react faster to new assignments, deadlines, and completed work without checking every page manually.",
  },
  {
    question: "What should I do if something doesn’t work?",
    answer:
      "Use the help options below to review quick answers or contact support directly so we can troubleshoot the issue with you.",
  },
];

const homeHelpCards = [
  {
    title: "Help Center",
    copy: "Use browser articles and YouTube channels to learn task setup, onboarding, and workspace navigation.",
    links: [
      { label: "Chrome Articles", href: "https://www.google.com/search?q=task+management+articles" },
      { label: "YouTube Guides", href: "https://www.youtube.com/results?search_query=task+management+tutorials" },
    ],
    icon: ListCheckIcon,
  },
  {
    title: "Support",
    copy: "For account support or project help, contact the admin directly by email.",
    email: "alexcheruuo@gmail.com",
    socialLinks: [
      { label: "GitHub", href: "https://github.com/", icon: GithubIcon },
      { label: "X", href: "https://x.com/", icon: TwitterIcon },
      { label: "Facebook", href: "https://facebook.com/", icon: FacebookIcon },
    ],
    icon: TeamIcon,
  },
];

function getInitials(name) {
  if (!name) {
    return "CT";
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDisplayDate(value) {
  if (!value) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatRelativeDueDate(value) {
  if (!value) {
    return "No deadline set";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(value);
  dueDate.setHours(0, 0, 0, 0);

  const differenceInDays = Math.round(
    (dueDate.getTime() - today.getTime()) / 86400000
  );

  if (differenceInDays === 0) {
    return "Due today";
  }

  if (differenceInDays === 1) {
    return "Due tomorrow";
  }

  if (differenceInDays === -1) {
    return "1 day overdue";
  }

  if (differenceInDays > 1) {
    return `Due in ${differenceInDays} days`;
  }

  return `${Math.abs(differenceInDays)} days overdue`;
}

function getPriorityLabel(priority) {
  if (priority === "high") {
    return "High";
  }

  if (priority === "low") {
    return "Low";
  }

  return "Medium";
}

function formatShortDay(value) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(value);
}

function formatMonthLabel(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function getDaysUntilDate(value) {
  if (!value) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(value);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function buildTrendPath(points, chartHeight) {
  if (!points.length) {
    return "";
  }

  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${point.x} ${chartHeight - point.y}`;
    })
    .join(" ");
}

function buildAreaPath(points, chartHeight) {
  if (!points.length) {
    return "";
  }

  const line = buildTrendPath(points, chartHeight);
  const first = points[0];
  const last = points[points.length - 1];

  return `${line} L ${last.x} ${chartHeight} L ${first.x} ${chartHeight} Z`;
}

function getViewMeta(pathname, user) {
  const username = user?.username || "Alex";

  if (pathname === "/") {
      return {
      kicker: "Welcome",
      title: "Home",
      subtitle: "Simplify work, empower teams, and access your workspace with login or registration.",
    };
  }

  if (pathname === "/board") {
    return {
      kicker: "Task workspace",
      title: "Task Board",
      subtitle: `Track work by status and move quickly through ${username}'s open tasks.`,
    };
  }

  if (pathname === "/tasks") {
    return {
      kicker: "Task workspace",
      title: "Tasks",
      subtitle: `Create a new task, update an existing one, and manage the queue in one place.`,
    };
  }

  if (pathname === "/analytics") {
    return {
      kicker: "Performance overview",
      title: "Analytics",
      subtitle: `See live completion trends, task mix, and momentum across the current workspace.`,
    };
  }

  if (pathname === "/calendar") {
    return {
      kicker: "Planning view",
      title: "Calendar",
      subtitle: "Review task timing and due dates in a calendar-focused workspace.",
    };
  }

  if (pathname === "/team") {
    return {
      kicker: "Collaboration view",
      title: "Team",
      subtitle: "See how the team workload is distributed across the current task list.",
    };
  }

  return {
    kicker: "Workspace overview",
    title: "Dashboard",
    subtitle: user
      ? `Welcome back, ${user.username}. Here is your live project overview.`
      : "Welcome back, Alex. Here is your project overview.",
  };
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("taskflow_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [tasks, setTasks] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    role: "employee",
    password: "",
    password_confirm: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);
  const [authMode, setAuthMode] = useState("");
  const [notificationSounds, setNotificationSounds] = useState(() => {
    const storedValue = localStorage.getItem("notification_sounds");
    return storedValue ? storedValue === "on" : true;
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const initialDate = new Date();
    initialDate.setDate(1);
    initialDate.setHours(0, 0, 0, 0);
    return initialDate;
  });
  const alertedDueTasksRef = useRef(new Set());
  const seenAssignedTasksRef = useRef(new Set());

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((firstTask, secondTask) => {
        if (firstTask.completed !== secondTask.completed) {
          return Number(firstTask.completed) - Number(secondTask.completed);
        }

        return new Date(secondTask.created_at) - new Date(firstTask.created_at);
      }),
    [tasks]
  );

  const recentTasks = useMemo(() => sortedTasks.slice(0, 5), [sortedTasks]);

  const boardColumns = useMemo(
    () => [
      {
        id: "todo",
        title: "To Do",
        tone: "neutral",
        tasks: sortedTasks.filter(
          (task) => !task.completed && task.priority !== "high"
        ),
      },
      {
        id: "urgent",
        title: "High Priority",
        tone: "danger",
        tasks: sortedTasks.filter(
          (task) => !task.completed && task.priority === "high"
        ),
      },
      {
        id: "done",
        title: "Completed",
        tone: "success",
        tasks: sortedTasks.filter((task) => task.completed),
      },
    ],
    [sortedTasks]
  );

  const analyticsSeries = useMemo(() => {
    const dayBuckets = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));

      return {
        key: date.toISOString().slice(0, 10),
        label: formatShortDay(date),
        created: 0,
        completed: 0,
      };
    });

    tasks.forEach((task) => {
      const createdKey = task.created_at?.slice(0, 10);
      const bucket = dayBuckets.find((item) => item.key === createdKey);

      if (bucket) {
        bucket.created += 1;
        if (task.completed) {
          bucket.completed += 1;
        }
      }
    });

    const total = tasks.length || 1;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    const low = tasks.filter((task) => task.priority === "low").length;
    const medium = tasks.filter((task) => task.priority === "medium").length;
    const high = tasks.filter((task) => task.priority === "high").length;
    const maxDayValue = Math.max(
      ...dayBuckets.map((item) => Math.max(item.created, item.completed)),
      1
    );

    return {
      dayBuckets,
      maxDayValue,
      statusBreakdown: [
        {
          label: "Completed",
          value: completed,
          percent: Math.round((completed / total) * 100),
          tone: "success",
        },
        {
          label: "Pending",
          value: pending,
          percent: Math.round((pending / total) * 100),
          tone: "neutral",
        },
      ],
      priorityBreakdown: [
        {
          label: "Low priority",
          value: low,
          percent: Math.round((low / total) * 100),
          tone: "success",
        },
        {
          label: "Medium priority",
          value: medium,
          percent: Math.round((medium / total) * 100),
          tone: "warning",
        },
        {
          label: "High priority",
          value: high,
          percent: Math.round((high / total) * 100),
          tone: "danger",
        },
      ],
    };
  }, [tasks]);

  const analyticsVisuals = useMemo(() => {
    const chartWidth = 560;
    const chartHeight = 220;
    const step = analyticsSeries.dayBuckets.length > 1
      ? chartWidth / (analyticsSeries.dayBuckets.length - 1)
      : chartWidth;

    const createdPoints = analyticsSeries.dayBuckets.map((bucket, index) => ({
      x: Math.round(index * step),
      y: Math.round((bucket.created / analyticsSeries.maxDayValue) * (chartHeight - 24)),
    }));

    const completedPoints = analyticsSeries.dayBuckets.map((bucket, index) => ({
      x: Math.round(index * step),
      y: Math.round((bucket.completed / analyticsSeries.maxDayValue) * (chartHeight - 24)),
    }));

    const totalPriority = analyticsSeries.priorityBreakdown.reduce(
      (sum, item) => sum + item.value,
      0
    ) || 1;

    const pieSegments = analyticsSeries.priorityBreakdown.map((item) => ({
      ...item,
      share: (item.value / totalPriority) * 100,
    }));

    let cumulative = 0;
    const pieStyle = {
      background: `conic-gradient(${pieSegments
        .map((segment) => {
          const start = cumulative;
          cumulative += segment.share;
          const color =
            segment.tone === "success"
              ? "#25c28f"
              : segment.tone === "warning"
                ? "#f59f0b"
                : "#f05d5e";

          return `${color} ${start}% ${cumulative}%`;
        })
        .join(", ")})`,
    };

    return {
      chartWidth,
      chartHeight,
      createdLine: buildTrendPath(createdPoints, chartHeight),
      createdArea: buildAreaPath(createdPoints, chartHeight),
      completedLine: buildTrendPath(completedPoints, chartHeight),
      pieStyle,
      pieSegments,
    };
  }, [analyticsSeries]);

  const derivedStatistics = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    const pending = tasks.length - completed;
    const highPriority = tasks.filter(
      (task) => task.priority === "high" && !task.completed
    ).length;

    return {
      total: statistics?.total ?? tasks.length,
      completed: statistics?.completed ?? completed,
      pending: statistics?.pending ?? pending,
      high_priority: statistics?.high_priority ?? highPriority,
      completion_percentage:
        statistics?.completion_percentage ??
        (tasks.length ? (completed / tasks.length) * 100 : 0),
    };
  }, [statistics, tasks]);

  const statCards = useMemo(
    () => [
      {
        label: "Total Tasks",
        value: derivedStatistics.total,
        hint: `${derivedStatistics.pending} still in motion`,
        tone: "neutral",
        icon: ListCheckIcon,
      },
      {
        label: "Completed",
        value: derivedStatistics.completed,
        hint: `${Math.round(derivedStatistics.completion_percentage)}% done`,
        tone: "success",
        icon: CheckCircleIcon,
      },
      {
        label: "In Progress",
        value: derivedStatistics.pending,
        hint:
          derivedStatistics.pending === 0
            ? "Queue is clear"
            : `${derivedStatistics.pending} active now`,
        tone: "warning",
        icon: ClockIcon,
      },
      {
        label: "Pending",
        value: derivedStatistics.high_priority,
        hint:
          derivedStatistics.high_priority === 0
            ? "No urgent blockers"
            : "High priority items",
        tone: "danger",
        icon: AlertIcon,
      },
    ],
    [derivedStatistics]
  );

  const teamRoster = useMemo(() => {
    return assignableUsers.map((member) => {
      const assignedTasks = tasks.filter((task) => task.assignee === member.id);
      const completedTasks = assignedTasks.filter((task) => task.completed).length;

      return {
        ...member,
        assignedCount: assignedTasks.length,
        completedCount: completedTasks,
        activeCount: assignedTasks.length - completedTasks,
      };
    });
  }, [assignableUsers, tasks]);

  const calendarData = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const dueTaskMap = new Map();
    sortedTasks
      .filter((task) => task.due_date)
      .forEach((task) => {
        const dueDate = new Date(task.due_date);
        const key = dueDate.toISOString().slice(0, 10);
        const existing = dueTaskMap.get(key) || [];
        existing.push(task);
        dueTaskMap.set(key, existing);
      });

    const days = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      const dayTasks = dueTaskMap.get(key) || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return {
        key,
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        tasks: dayTasks,
      };
    });

    return {
      label: formatMonthLabel(calendarMonth),
      days,
      monthTaskCount: sortedTasks.filter((task) => {
        if (!task.due_date) {
          return false;
        }

        const dueDate = new Date(task.due_date);
        return dueDate.getFullYear() === year && dueDate.getMonth() === month;
      }).length,
      upcoming: sortedTasks.filter((task) => task.due_date).slice(0, 5),
      monthStart: firstDay,
      monthEnd: lastDay,
    };
  }, [calendarMonth, sortedTasks]);

  const viewMeta = useMemo(
    () => getViewMeta(location.pathname, user),
    [location.pathname, user]
  );

  const protectedPaths = useMemo(
    () => ["/dashboard", "/board", "/tasks", "/calendar", "/team", "/analytics"],
    []
  );

  const currentRole = useMemo(() => getUserRole(user), [user]);
  const allowedRoutes = useMemo(
    () => roleRouteAccess[currentRole] || roleRouteAccess.employee,
    [currentRole]
  );
  const visibleNavItems = useMemo(
    () => navItems.filter((item) => item.path === "/" || allowedRoutes.includes(item.path)),
    [allowedRoutes]
  );

  useEffect(() => {
    if (!token && protectedPaths.includes(location.pathname)) {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate, protectedPaths, token]);

  useEffect(() => {
    if (token && protectedPaths.includes(location.pathname) && !allowedRoutes.includes(location.pathname)) {
      navigate("/dashboard", { replace: true });
    }
  }, [allowedRoutes, location.pathname, navigate, protectedPaths, token]);

  useEffect(() => {
    localStorage.setItem("token", token);
    if (!token) {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("taskflow_user", JSON.stringify(user));
      return;
    }

    localStorage.removeItem("taskflow_user");
  }, [user]);

  useEffect(() => {
    localStorage.setItem("notification_sounds", notificationSounds ? "on" : "off");
  }, [notificationSounds]);

  useEffect(() => {
    if (!token) {
      setTasks([]);
      setAssignableUsers([]);
      setStatistics(null);
      setLoadingTasks(false);
      alertedDueTasksRef.current.clear();
      return;
    }

    loadTasks();
    loadStatistics();
    if (currentRole !== "employee") {
      loadAssignableUsers();
    } else {
      setAssignableUsers([]);
    }
  }, [currentRole, token]);

  useEffect(() => {
    if (!token || !notificationSounds) {
      return;
    }

    const dueSoonTasks = sortedTasks.filter((task) => {
      if (task.completed || !task.due_date) {
        return false;
      }

      const daysUntil = getDaysUntilDate(task.due_date);
      return daysUntil !== null && daysUntil >= 0 && daysUntil <= 1;
    });

    const newAlerts = dueSoonTasks.filter((task) => !alertedDueTasksRef.current.has(task.id));
    if (!newAlerts.length) {
      return;
    }

    newAlerts.forEach((task) => {
      alertedDueTasksRef.current.add(task.id);
    });

    playNotificationSound("reminder");
    setMessage(`Reminder: ${newAlerts.length} task${newAlerts.length > 1 ? "s are" : " is"} due soon.`);
  }, [notificationSounds, sortedTasks, token]);

  useEffect(() => {
    if (!token) {
      seenAssignedTasksRef.current.clear();
      return;
    }

    if (currentRole !== "employee" || !user?.id) {
      return;
    }

    const assignedToUser = sortedTasks.filter((task) => task.assignee === user.id);
    const newAssignments = assignedToUser.filter((task) => !seenAssignedTasksRef.current.has(task.id));

    assignedToUser.forEach((task) => {
      seenAssignedTasksRef.current.add(task.id);
    });

    if (!newAssignments.length) {
      return;
    }

    playNotificationSound("reminder");
    setMessage(
      `You have ${newAssignments.length} new assigned task${newAssignments.length > 1 ? "s" : ""}.`
    );
  }, [currentRole, sortedTasks, token, user?.id]);

  function isAssignedToCurrentUser(task) {
    return Boolean(user?.id && task.assignee === user.id);
  }

  function playNotificationSound(type = "default") {
    if (!notificationSounds || typeof window === "undefined") {
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const now = context.currentTime;
    const patterns = {
      success: [
        { frequency: 659.25, duration: 0.08, delay: 0 },
        { frequency: 783.99, duration: 0.1, delay: 0.11 },
      ],
      reminder: [
        { frequency: 523.25, duration: 0.1, delay: 0 },
        { frequency: 587.33, duration: 0.1, delay: 0.14 },
        { frequency: 523.25, duration: 0.12, delay: 0.28 },
      ],
      subtle: [{ frequency: 493.88, duration: 0.08, delay: 0 }],
      delete: [{ frequency: 261.63, duration: 0.12, delay: 0 }],
      default: [{ frequency: 440, duration: 0.08, delay: 0 }],
    };

    const notes = patterns[type] || patterns.default;

    notes.forEach(({ frequency, duration, delay }) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.0001, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.05, now + delay + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(now + delay);
      oscillator.stop(now + delay + duration);
    });

    const patternEnd = Math.max(...notes.map((note) => note.delay + note.duration), 0.2);
    window.setTimeout(() => {
      context.close().catch(() => {});
    }, Math.ceil(patternEnd * 1000) + 120);
  }

  async function loadTasks() {
    setLoadingTasks(true);

    try {
      const data = await fetchTasks(token);
      setTasks(Array.isArray(data) ? data : data?.results || []);
    } catch (requestError) {
      setError(requestError.message);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }

  async function loadStatistics() {
    try {
      const data = await fetchTaskStatistics(token);
      setStatistics(data);
    } catch (requestError) {
      console.error("Failed to load statistics", requestError);
      setStatistics(null);
    }
  }

  async function loadAssignableUsers() {
    try {
      const data = await fetchAssignableUsers(token);
      setAssignableUsers(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error("Failed to load assignable users", requestError);
      setAssignableUsers([]);
    }
  }

  function handleTaskFieldChange(event) {
    const { name, value } = event.target;
    setTaskForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleLoginFieldChange(event) {
    const { name, value } = event.target;
    setLoginForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleRegisterFieldChange(event) {
    const { name, value } = event.target;
    setRegisterForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function resetMessages() {
    setError("");
    setMessage("");
  }

  function normalizeTaskPayload(form) {
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      assignee: form.assignee ? Number(form.assignee) : null,
      priority: form.priority,
      completed: false,
      due_date: form.due_date ? `${form.due_date}T00:00:00Z` : null,
    };
  }

  async function handleTaskSubmit(event) {
    event.preventDefault();
    resetMessages();

    if (!taskForm.title.trim()) {
      setError("Task title is required.");
      return;
    }

    const payload = normalizeTaskPayload(taskForm);
    setBusyAction(editingTaskId ? "save-task" : "create-task");

    try {
      if (editingTaskId) {
        const existingTask = tasks.find((task) => task.id === editingTaskId);
        await updateTask(token, editingTaskId, {
          ...existingTask,
          ...payload,
          completed: existingTask.completed,
        });
        setMessage("Task updated successfully.");
        playNotificationSound("success");
      } else {
        await createTask(token, payload);
        setMessage("Task created successfully.");
        playNotificationSound("success");
      }

      setTaskForm(emptyTaskForm);
      setEditingTaskId(null);
      navigate("/dashboard");
      await loadTasks();
      await loadStatistics();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyAction("");
    }
  }

  async function toggleTask(task) {
    resetMessages();
    setBusyAction(`toggle-${task.id}`);

    try {
      await updateTask(token, task.id, {
        ...task,
        completed: !task.completed,
      });
      playNotificationSound(task.completed ? "subtle" : "success");
      await loadTasks();
      await loadStatistics();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyAction("");
    }
  }

  async function deleteTask(taskId) {
    resetMessages();
    setBusyAction(`delete-${taskId}`);

    try {
      await deleteTaskRequest(token, taskId);

      if (editingTaskId === taskId) {
        setEditingTaskId(null);
        setTaskForm(emptyTaskForm);
      }

      setMessage("Task deleted successfully.");
      playNotificationSound("delete");
      await loadTasks();
      await loadStatistics();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyAction("");
    }
  }

  function startEditing(task) {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      assignee: task.assignee ? String(task.assignee) : "",
      priority: task.priority || "medium",
      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
    });
    navigate("/tasks");
    resetMessages();
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setTaskForm(emptyTaskForm);
    resetMessages();
  }

  async function handleLogin(event) {
    event.preventDefault();
    resetMessages();

    setBusyAction("login");

    try {
      const data = await loginRequest({
        username: loginForm.username,
        password: loginForm.password,
      });
      setToken(data.token);
      setUser(data.user);
      setLoginForm({ username: "", password: "" });
      setAuthMode("");
      setMessage(`Welcome back, ${data.user.username}.`);
      playNotificationSound("success");
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleSendOtp(event) {
    event.preventDefault();
    resetMessages();

    if (!registerForm.email.trim()) {
      setError("Provide an email address to receive the OTP.");
      return;
    }

    if (
      !registerForm.username.trim() ||
      !registerForm.password ||
      !registerForm.password_confirm
    ) {
      setError("Complete the registration form before requesting OTP.");
      return;
    }

    if (registerForm.password !== registerForm.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusyAction("send-otp");

    try {
      const data = await sendRegistrationOtp({
        email: registerForm.email,
      });
      setOtpSent(true);
      setAuthMode("register");
      setMessage(`${data.message}. In local development, the email OTP code is printed in the backend terminal.`);
      playNotificationSound("subtle");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    resetMessages();

    if (!registerForm.otp.trim()) {
      setError("Enter the OTP before completing registration.");
      return;
    }

    setBusyAction("verify-otp");

    try {
      const data = await verifyRegistrationOtp(registerForm);
      setLoginForm((currentForm) => ({
        ...currentForm,
        username: registerForm.username,
      }));
      setRegisterForm({
        username: "",
        email: "",
        role: "employee",
        password: "",
        password_confirm: "",
        otp: "",
      });
      setOtpSent(false);
      setAuthMode("login");
      setMessage(`${data.message} You can now log in with your username and password.`);
      playNotificationSound("success");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleLogout() {
    resetMessages();
    setBusyAction("logout");

    try {
      await logoutRequest(token);
    } catch (requestError) {
      console.error("Logout request failed", requestError);
    } finally {
      setToken("");
      setUser(null);
      setBusyAction("");
      setAuthMode("");
      setMessage("You have been logged out.");
    }
  }

  function closeAuthMode() {
    setAuthMode("");
    setOtpSent(false);
    setRegisterForm({
      username: "",
      email: "",
      role: "employee",
      password: "",
      password_confirm: "",
      otp: "",
    });
    resetMessages();
  }

  function renderAuthPanel(panelClassName = "auth-panel") {
    const isHomePanel = panelClassName === "home-auth-panel";

    return (
      <article className={`surface ${panelClassName}`}>
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Account</p>
            <h2>
              {user
                ? "Session details"
                : otpSent
                  ? "Verify your OTP"
                  : authMode === "login"
                    ? "Sign in to CherruTech"
                    : authMode === "register"
                      ? "Create your account"
                      : "Choose how to continue"}
            </h2>
          </div>
        </div>

        {user ? (
          <div className="session-card">
            <div className="session-avatar">{getInitials(user.username)}</div>
            <div>
              <strong>{user.username}</strong>
              <p>{user.email || "Authenticated user"}</p>
            </div>
            <LogoutButton onLogout={handleLogout} busyAction={busyAction} />
          </div>
        ) : !authMode && !otpSent ? (
          <div className="auth-choice-panel">
            <p className="auth-choice-copy">
              Choose one option to continue. You can sign in with your account or
              create a new one from here.
            </p>
            <div className="auth-choice-actions">
              <button
                type="button"
                className="dark-button"
                onClick={() => {
                  resetMessages();
                  setAuthMode("login");
                }}
              >
                Login
              </button>
              <button
                type="button"
                className={isHomePanel ? "ghost-button home-cta-secondary" : "soft-button"}
                onClick={() => {
                  resetMessages();
                  setAuthMode("register");
                }}
              >
                Register
              </button>
            </div>
          </div>
        ) : authMode === "login" ? (
          <div className="auth-single-form">
            <div className="auth-form-topbar">
              <button type="button" className="text-button" onClick={closeAuthMode}>
                Back
              </button>
            </div>
            <LoginForm
              form={loginForm}
              onChange={handleLoginFieldChange}
              onSubmit={handleLogin}
              busyAction={busyAction}
            />
          </div>
        ) : (
          <div className="auth-single-form">
            <div className="auth-form-topbar">
              <button
                type="button"
                className="text-button"
                onClick={closeAuthMode}
                disabled={busyAction === "send-otp" || busyAction === "verify-otp"}
              >
                Back
              </button>
            </div>
            <form
              className="stack-form register-form"
              onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
            >
              <h3>{otpSent ? "Verify OTP" : "Register"}</h3>
              <label>
                Username
                <input
                  name="username"
                  value={registerForm.username}
                  onChange={handleRegisterFieldChange}
                  disabled={otpSent}
                  placeholder="Choose a username"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterFieldChange}
                  disabled={otpSent}
                  placeholder="name@example.com"
                />
              </label>
              <label>
                Role
                <select
                  name="role"
                  value={registerForm.role}
                  onChange={handleRegisterFieldChange}
                  disabled={otpSent}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterFieldChange}
                  disabled={otpSent}
                  placeholder="Create a password"
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  name="password_confirm"
                  value={registerForm.password_confirm}
                  onChange={handleRegisterFieldChange}
                  disabled={otpSent}
                  placeholder="Repeat the password"
                />
              </label>
              {otpSent ? (
                <label>
                  OTP code
                  <input
                    name="otp"
                    value={registerForm.otp}
                    onChange={handleRegisterFieldChange}
                    placeholder="Enter the 6-digit code"
                  />
                </label>
              ) : null}
              <button
                type="submit"
                className="soft-button full-width"
                disabled={busyAction === "send-otp" || busyAction === "verify-otp"}
              >
                {busyAction === "send-otp"
                  ? "Sending OTP..."
                  : busyAction === "verify-otp"
                    ? "Verifying..."
                    : otpSent
                      ? "Verify OTP and register"
                      : "Send OTP"}
              </button>
            </form>
          </div>
        )}
      </article>
    );
  }

  const isHomePage = location.pathname === "/";

  return (
    <div className={`dashboard-shell${isHomePage ? " home-shell" : ""}`}>
      {!isHomePage ? (
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">
              <CheckBadgeIcon />
            </div>
            <div>
              <p className="brand-title">CherruTech</p>
              <p className="brand-subtitle">Project command center</p>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Primary">
            {visibleNavItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `nav-item${isActive ? " active" : ""}`
                }
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-profile">
            <div className="avatar">{getInitials(user?.username || "Alex Chen")}</div>
            <div>
              <p className="profile-name">{user?.username || "Alex Chen"}</p>
              <p className="profile-role">
                {user ? `${roleLabels[currentRole] || "Employee"} • ${user.email || "Member"}` : "Admin"}
              </p>
            </div>
            <button
              type="button"
              className="sound-toggle"
              onClick={() => setNotificationSounds((current) => !current)}
              aria-pressed={notificationSounds}
              title={notificationSounds ? "Mute notification sounds" : "Enable notification sounds"}
            >
              {notificationSounds ? "Sound on" : "Sound off"}
            </button>
          </div>
        </aside>
      ) : null}

      <main className={`dashboard-main${isHomePage ? " home-main" : ""}`}>
        {!isHomePage ? (
          <section className="page-header">
            <div>
              <p className="section-kicker">{viewMeta.kicker}</p>
              <h1>{viewMeta.title}</h1>
              <p className="page-subtitle">{viewMeta.subtitle}</p>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="soft-button"
                onClick={() => navigate("/tasks")}
              >
                <PlusIcon />
                <span>{editingTaskId ? "Edit task" : "New task"}</span>
              </button>
              <button
                type="button"
                className="dark-button"
                onClick={() => {
                  loadTasks();
                  loadStatistics();
                }}
              >
                Refresh data
              </button>
            </div>
          </section>
        ) : null}

        {error ? <div className="banner error">{error}</div> : null}
        {message ? <div className="banner success">{message}</div> : null}

        {location.pathname !== "/" ? (
          <section className="stats-grid">
            {statCards.map(({ label, value, hint, tone, icon: Icon }) => (
              <article className="metric-card" key={label}>
                <div className="metric-copy">
                  <p>{label}</p>
                  <strong>{value}</strong>
                  <span className={`metric-hint ${tone}`}>{hint}</span>
                </div>
                <div className={`metric-icon ${tone}`}>
                  <Icon />
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {location.pathname === "/" ? (
          <section className="home-page">
            <header className="home-topbar">
              <div className="home-brand">
                <div className="home-brand-mark">
                  <CheckBadgeIcon />
                </div>
                <div>
                  <p className="home-brand-title">CherruTech</p>
                  <p className="home-brand-subtitle">Project command center</p>
                </div>
              </div>

              <nav className="home-nav-actions" aria-label="Account navigation">
                {token ? (
                  <button
                    type="button"
                    className="dark-button home-nav-button"
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`ghost-button home-nav-button${authMode === "login" ? " home-nav-button-active" : ""}`}
                      onClick={() => {
                        resetMessages();
                        setOtpSent(false);
                        setAuthMode("login");
                      }}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className={`dark-button home-nav-button${authMode === "register" || otpSent ? " home-nav-button-active" : ""}`}
                      onClick={() => {
                        resetMessages();
                        setAuthMode("register");
                      }}
                    >
                      Register
                    </button>
                  </>
                )}
              </nav>
            </header>

            <section className="home-hero-shell">
              <div className="home-orb home-orb-left" />
              <div className="home-orb home-orb-right" />
              {token || authMode || otpSent ? renderAuthPanel("home-auth-panel") : null}
              <article className="home-hero">
                <p className="section-kicker home-kicker">CherruTech Platform</p>
                <h2>
                  Simplify <span>Work.</span>
                  <br />
                  Empower <span>Teams.</span>
                  <br />
                  Track Tasks <span>Smarter.</span>
                </h2>
                <p className="home-copy">
                  CherruTech helps teams organize projects, hit deadlines, and stay
                  aligned with one clear workspace for planning, updates, and
                  delivery.
                </p>
                <div className="home-actions">
                  <button
                    type="button"
                    className="dark-button home-cta-primary"
                    onClick={() => {
                      resetMessages();
                      setAuthMode("register");
                    }}
                  >
                    Register
                  </button>
                  <button
                    type="button"
                    className="ghost-button home-cta-secondary"
                    onClick={() => {
                      resetMessages();
                      setOtpSent(false);
                      setAuthMode("login");
                    }}
                  >
                    Login
                  </button>
                </div>
              </article>

              <article className="home-showcase">
                <div className="home-showcase-header">
                  <div className="home-window-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <strong>Tasks</strong>
                </div>
                <div className="home-board">
                  {homeShowcaseColumns.map((column) => (
                    <div className="home-board-column" key={column.title}>
                      <div className="home-board-label">
                        <span>{column.title}</span>
                        <small>({column.count})</small>
                      </div>
                      {column.tasks.map((task) => (
                        <article className="home-mini-card" key={`${column.title}-${task.label}`}>
                          <span className={`home-mini-pill ${column.tone}`}>{task.priority}</span>
                          <h3>{task.label}</h3>
                          <p>Keep progress visible and teams aligned in one flow.</p>
                          <div className="home-mini-footer">
                            <small>{task.due}</small>
                            <div className="home-mini-avatars">
                              <span>A</span>
                              <span>M</span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="home-floating-chip chip-left">Clear Priorities</div>
                <div className="home-floating-chip chip-center">Team Visibility</div>
                <div className="home-floating-chip chip-right">Easy Task Updates</div>
              </article>
            </section>

            <section className="home-section">
              <div className="home-section-heading">
                <h3>Powerful Features For Seamless Collaboration</h3>
                <p>
                  Work smarter together with tools that keep tasks clear and teams
                  connected.
                </p>
              </div>
              <div className="home-feature-grid">
                {homeFeatureCards.map(({ title, copy, icon: Icon }) => (
                  <article className="home-info-card" key={title}>
                    <div className="home-info-icon">
                      <Icon />
                    </div>
                    <h4>{title}</h4>
                    <p>{copy}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="home-section">
              <div className="home-section-heading">
                <h3>Features For Roles</h3>
                <p>
                  Tailored views and controls for employees, managers, and admins
                  alike.
                </p>
              </div>
              <div className="home-role-grid">
                {homeRoleCards.map(({ title, copy, icon: Icon }) => (
                  <article className="home-role-card" key={title}>
                    <div className="home-role-icon">
                      <Icon />
                    </div>
                    <h4>{title}</h4>
                    <p>{copy}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="home-section home-faq-section">
              <div className="home-section-heading">
                <h3>Frequently Asked Questions</h3>
                <p>Quick answers to common questions about using CherruTech.</p>
              </div>
              <div className="home-faq-list">
                {homeFaqItems.map((item, index) => {
                  const isActive = activeFaqIndex === index;

                  return (
                    <button
                      key={item.question}
                      type="button"
                      className={`home-faq-item ${isActive ? "active" : ""}`}
                      onClick={() => setActiveFaqIndex(isActive ? -1 : index)}
                    >
                      <div className="home-faq-row">
                        <span>{item.question}</span>
                        <span className="home-faq-toggle">{isActive ? "x" : "+"}</span>
                      </div>
                      {isActive ? <p>{item.answer}</p> : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="home-section home-help-section">
              <div className="home-section-heading">
                <h3>Need Help? We're Here.</h3>
                <p>
                  Find quick answers, or reach out to our support team for help.
                </p>
              </div>
              <div className="home-help-grid">
                {homeHelpCards.map(({ title, copy, links, email, socialLinks, icon: Icon }) => (
                  <article className="home-help-card" key={title}>
                    <div className="home-help-icon">
                      <Icon />
                    </div>
                    <h4>{title}</h4>
                    <p>{copy}</p>
                    {links ? (
                      <div className="home-help-links">
                        {links.map((link) => (
                          <a
                            key={link.label}
                            className="ghost-button home-help-button"
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                    {email ? (
                      <a className="ghost-button home-help-button" href={`mailto:${email}`}>
                        {email}
                      </a>
                    ) : null}
                    {socialLinks ? (
                      <div className="home-social-links">
                        {socialLinks.map(({ label, href, icon: SocialIcon }) => (
                          <a
                            key={label}
                            className="home-social-link"
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={label}
                            title={label}
                          >
                            <SocialIcon />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          </section>
        ) : null}

        {location.pathname === "/dashboard" ? (
          <section className="content-grid">
            <section className="primary-column">
            <article className="surface table-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Recent tasks</p>
                  <h2>Latest work items</h2>
                </div>
                <div className="header-actions">
                  <span className="panel-pill">
                    {loadingTasks ? "Syncing" : `${tasks.length} tasks`}
                  </span>
                  <button
                    type="button"
                    className="soft-button"
                    onClick={() => navigate("/tasks")}
                  >
                    <PlusIcon />
                    <span>Add task</span>
                  </button>
                </div>
              </div>

              {loadingTasks ? (
                <p className="empty-state">Loading tasks...</p>
              ) : recentTasks.length === 0 ? (
                <p className="empty-state">
                  No tasks found yet. Use the `Add Task` page from the sidebar to create one.
                </p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Deadline</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTasks.map((task) => (
                        <tr key={task.id}>
                          <td>
                            <div className="task-cell">
                              <strong>{task.title}</strong>
                              <span>
                                {task.description || "No description added"}
                                {task.assignee_name ? ` • Assigned to ${task.assignee_name}` : ""}
                              </span>
                              {isAssignedToCurrentUser(task) ? (
                                <span className="assignment-badge">Assigned to you</span>
                              ) : null}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`status-pill ${task.completed ? "done" : "pending"}`}
                            >
                              {task.completed ? "Completed" : "In progress"}
                            </span>
                          </td>
                          <td>
                            <span className={`priority-pill ${task.priority}`}>
                              {getPriorityLabel(task.priority)}
                            </span>
                          </td>
                          <td>
                            <div className="deadline-cell">
                              <strong>{formatDisplayDate(task.due_date)}</strong>
                              <span>{formatRelativeDueDate(task.due_date)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                type="button"
                                className="text-button"
                                onClick={() => toggleTask(task)}
                                disabled={busyAction === `toggle-${task.id}`}
                              >
                                {busyAction === `toggle-${task.id}`
                                  ? "Saving..."
                                  : task.completed
                                    ? "Reopen"
                                    : "Complete"}
                              </button>
                              <button
                                type="button"
                                className="text-button"
                                onClick={() => startEditing(task)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="text-button danger"
                                onClick={() => deleteTask(task.id)}
                                disabled={busyAction === `delete-${task.id}`}
                              >
                                {busyAction === `delete-${task.id}`
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
            </section>

            <aside className="secondary-column">
            <article className="surface quick-links-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Workspace</p>
                  <h2>Go where you need next</h2>
                </div>
              </div>
              <div className="quick-links-list">
                {currentRole !== "employee" ? (
                  <NavLink className="quick-link-card" to="/tasks">
                    <div className="quick-link-icon">
                      <PlusIcon />
                    </div>
                    <div>
                      <strong>Add Task</strong>
                      <p>Create a new task or edit one you selected from the dashboard.</p>
                    </div>
                  </NavLink>
                ) : null}
                <NavLink className="quick-link-card" to="/board">
                  <div className="quick-link-icon">
                    <BoardIcon />
                  </div>
                  <div>
                    <strong>Task Board</strong>
                    <p>View work by status and move between open, urgent, and completed items.</p>
                  </div>
                </NavLink>
                {currentRole !== "employee" ? (
                  <NavLink className="quick-link-card" to="/analytics">
                    <div className="quick-link-icon">
                      <ChartIcon />
                    </div>
                    <div>
                      <strong>Analytics</strong>
                      <p>Check progress trends, completion rate, and task distribution at a glance.</p>
                    </div>
                  </NavLink>
                ) : null}
              </div>
            </article>
            </aside>
          </section>
        ) : null}

        {location.pathname === "/board" ? (
          <section className="surface board-panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Board</p>
                <h2>Tasks by status</h2>
              </div>
              <span className="panel-pill">Live from your task list</span>
            </div>

            {loadingTasks ? (
              <p className="empty-state">Loading board...</p>
            ) : (
              <div className="board-grid">
                {boardColumns.map((column) => (
                  <article className={`board-column ${column.tone}`} key={column.id}>
                    <div className="board-column-header">
                      <div>
                        <h3>{column.title}</h3>
                        <p>{column.tasks.length} tasks</p>
                      </div>
                    </div>

                    <div className="board-column-list">
                      {column.tasks.length === 0 ? (
                        <p className="empty-state">No tasks in this column.</p>
                      ) : (
                        column.tasks.map((task) => (
                          <article className="board-task" key={task.id}>
                            <div className="board-task-top">
                              <strong>{task.title}</strong>
                              <div className="board-task-badges">
                                {isAssignedToCurrentUser(task) ? (
                                  <span className="assignment-badge">Assigned to you</span>
                                ) : null}
                                <span className={`priority-pill ${task.priority}`}>
                                  {getPriorityLabel(task.priority)}
                                </span>
                              </div>
                            </div>
                            <p>{task.description || "No description added yet."}</p>
                          <div className="board-task-meta">
                              <span>{task.assignee_name ? `Assigned to ${task.assignee_name}` : "Unassigned"}</span>
                              <span>{formatRelativeDueDate(task.due_date)}</span>
                              <span>{task.completed ? "Completed" : "Active"}</span>
                            </div>
                            <div className="board-task-actions">
                              <button
                                type="button"
                                className="text-button"
                                onClick={() => toggleTask(task)}
                                disabled={busyAction === `toggle-${task.id}`}
                              >
                                {task.completed ? "Reopen" : "Complete"}
                              </button>
                              <button
                                type="button"
                                className="text-button"
                                onClick={() => startEditing(task)}
                              >
                                Edit
                              </button>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {location.pathname === "/analytics" ? (
          <section className="analytics-grid">
            <article className="surface analytics-panel analytics-panel-wide">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Analytics</p>
                  <h2>Active completion graph</h2>
                </div>
                <span className="panel-pill">Last 7 days</span>
              </div>

              <div className="chart-card active-chart-card">
                <div className="chart-legend">
                  <span><i className="legend-dot created" />Created</span>
                  <span><i className="legend-dot completed" />Completed</span>
                </div>
                <svg
                  className="trend-chart"
                  viewBox={`0 0 ${analyticsVisuals.chartWidth} ${analyticsVisuals.chartHeight}`}
                  role="img"
                  aria-label="Task creation and completion trend"
                >
                  <path className="trend-area" d={analyticsVisuals.createdArea} />
                  <path className="trend-line trend-line-created" d={analyticsVisuals.createdLine} />
                  <path
                    className="trend-line trend-line-completed"
                    d={analyticsVisuals.completedLine}
                  />
                  {analyticsSeries.dayBuckets.map((bucket, index) => {
                    const step =
                      analyticsSeries.dayBuckets.length > 1
                        ? analyticsVisuals.chartWidth /
                          (analyticsSeries.dayBuckets.length - 1)
                        : analyticsVisuals.chartWidth;
                    const x = Math.round(index * step);
                    const createdY =
                      analyticsVisuals.chartHeight -
                      Math.round(
                        (bucket.created / analyticsSeries.maxDayValue) *
                          (analyticsVisuals.chartHeight - 24)
                      );
                    const completedY =
                      analyticsVisuals.chartHeight -
                      Math.round(
                        (bucket.completed / analyticsSeries.maxDayValue) *
                          (analyticsVisuals.chartHeight - 24)
                      );

                    return (
                      <g key={bucket.key}>
                        <circle className="trend-point trend-point-created" cx={x} cy={createdY} r="5" />
                        <circle
                          className="trend-point trend-point-completed"
                          cx={x}
                          cy={completedY}
                          r="5"
                        />
                      </g>
                    );
                  })}
                </svg>
                <div className="trend-labels">
                  {analyticsSeries.dayBuckets.map((bucket) => (
                    <span key={bucket.key}>{bucket.label}</span>
                  ))}
                </div>
              </div>
            </article>

            <article className="surface analytics-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Distribution</p>
                  <h2>Priority pie chart</h2>
                </div>
              </div>

              <div className="pie-layout">
                <div className="pie-chart" style={analyticsVisuals.pieStyle}>
                  <div className="pie-chart-hole">
                    <strong>{derivedStatistics.total}</strong>
                    <span>tasks</span>
                  </div>
                </div>
                <div className="breakdown-list">
                  {analyticsVisuals.pieSegments.map((item) => (
                    <div className="breakdown-item compact" key={item.label}>
                      <div className="breakdown-copy">
                        <strong>{item.label}</strong>
                        <span>{item.value} tasks</span>
                      </div>
                      <span className={`breakdown-percent tone-${item.tone}`}>
                        {Math.round(item.share)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="surface analytics-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Snapshot</p>
                  <h2>Performance summary</h2>
                </div>
              </div>

              <div className="breakdown-list">
                {analyticsSeries.statusBreakdown.map((item) => (
                  <div className="breakdown-item" key={item.label}>
                    <div className="breakdown-copy">
                      <strong>{item.label}</strong>
                      <span>{item.value} tasks</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className={`progress-fill ${item.tone}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <span className={`breakdown-percent tone-${item.tone}`}>{item.percent}%</span>
                  </div>
                ))}
                <div className="analytics-note">
                  <strong>{Math.round(derivedStatistics.completion_percentage)}% completion rate</strong>
                  <span>
                    {derivedStatistics.high_priority === 0
                      ? "No urgent blockers right now."
                      : `${derivedStatistics.high_priority} high-priority tasks still need attention.`}
                  </span>
                </div>
              </div>
            </article>
          </section>
        ) : null}

        {location.pathname === "/tasks" ? (
          <section className="task-form-only">
            {currentRole === "employee" ? (
              <article className="surface quick-add-panel">
                <div className="panel-heading">
                  <div>
                    <p className="section-kicker">Role access</p>
                    <h2>Employees cannot create tasks</h2>
                  </div>
                </div>
                <p className="task-form-note">
                  Your current role lets you view tasks and update completion from the board or dashboard. Ask a manager
                  or admin to create new tasks.
                </p>
              </article>
            ) : (
            <article className="surface quick-add-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Quick add</p>
                  <h2>{editingTaskId ? "Update task" : "Add a task"}</h2>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    setEditingTaskId(null);
                    setTaskForm(emptyTaskForm);
                  }}
                >
                  Clear form
                </button>
              </div>

              <form className="stack-form" onSubmit={handleTaskSubmit}>
                <label>
                  Title
                  <input
                    name="title"
                    value={taskForm.title}
                    onChange={handleTaskFieldChange}
                    placeholder="What needs to get done?"
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    value={taskForm.description}
                    onChange={handleTaskFieldChange}
                    placeholder="Add context for the team"
                    rows="4"
                  />
                </label>
                <div className="inline-fields">
                  <label>
                    Assignee
                    <select
                      name="assignee"
                      value={taskForm.assignee}
                      onChange={handleTaskFieldChange}
                    >
                      <option value="">Select employee</option>
                      {assignableUsers.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.username} ({roleLabels[person.role] || "Employee"})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Priority
                    <select
                      name="priority"
                      value={taskForm.priority}
                      onChange={handleTaskFieldChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </label>
                  <label>
                    Due date
                    <input
                      type="date"
                      name="due_date"
                      value={taskForm.due_date}
                      onChange={handleTaskFieldChange}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="dark-button full-width"
                  disabled={busyAction === "create-task" || busyAction === "save-task"}
                >
                  {busyAction === "create-task"
                    ? "Creating..."
                    : busyAction === "save-task"
                      ? "Saving..."
                    : editingTaskId
                        ? "Save changes"
                        : "Add task"}
                </button>
              </form>
              <p className="task-form-note">
                This page is only for adding or editing tasks. Use `Dashboard` or `Task Board`
                to review the full task list.
              </p>
            </article>
            )}
          </section>
        ) : null}

        {location.pathname === "/calendar" ? (
          <section className="calendar-layout">
            <article className="surface calendar-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Calendar</p>
                  <h2>{calendarData.label}</h2>
                </div>
                <div className="header-actions">
                  <span className="panel-pill">{calendarData.monthTaskCount} due this month</span>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() =>
                      setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
                    }
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() =>
                      setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
                    }
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="calendar-weekdays">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarData.days.map((day) => (
                  <article
                    key={day.key}
                    className={`calendar-cell${day.isCurrentMonth ? "" : " muted"}${day.isToday ? " today" : ""}`}
                  >
                    <div className="calendar-cell-top">
                      <strong>{day.date.getDate()}</strong>
                      {day.tasks.length ? (
                        <span className="calendar-count">{day.tasks.length}</span>
                      ) : null}
                    </div>
                    <div className="calendar-events">
                      {day.tasks.slice(0, 2).map((task) => (
                        <span key={task.id} className={`calendar-event ${task.priority}`}>
                          {task.title}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <aside className="surface calendar-summary">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Agenda</p>
                  <h2>Upcoming deadlines</h2>
                </div>
              </div>
              {calendarData.upcoming.length === 0 ? (
                <p className="empty-state">Add tasks with due dates to populate the calendar.</p>
              ) : (
                <div className="placeholder-list">
                  {calendarData.upcoming.map((task) => (
                    <article className="board-task" key={task.id}>
                      <div className="board-task-top">
                        <strong>{task.title}</strong>
                        <div className="board-task-badges">
                          {isAssignedToCurrentUser(task) ? (
                            <span className="assignment-badge">Assigned to you</span>
                          ) : null}
                          <span className={`priority-pill ${task.priority}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                      </div>
                      <div className="board-task-meta">
                        <span>{task.assignee_name ? `Assigned to ${task.assignee_name}` : "Unassigned"}</span>
                        <span>{formatDisplayDate(task.due_date)}</span>
                        <span>{formatRelativeDueDate(task.due_date)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </aside>
          </section>
        ) : null}

        {location.pathname === "/team" ? (
          <section className="surface placeholder-panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Team</p>
                <h2>Registered team members</h2>
              </div>
            </div>
            {currentRole === "employee" ? (
              <p className="empty-state">Employees do not have access to the full registered team list.</p>
            ) : teamRoster.length === 0 ? (
              <p className="empty-state">No registered employees or managers found yet.</p>
            ) : (
              <div className="team-roster">
                {teamRoster.map((member) => (
                  <article className="team-member-card" key={member.id}>
                    <div className="team-member-head">
                      <div className="avatar">{getInitials(member.username)}</div>
                      <div>
                        <strong>{member.username}</strong>
                        <p>{member.email || "No email set"}</p>
                      </div>
                      <span className={`priority-pill ${member.role === "manager" ? "medium" : "low"}`}>
                        {roleLabels[member.role] || "Employee"}
                      </span>
                    </div>
                    <div className="team-member-stats">
                      <span>Assigned: {member.assignedCount}</span>
                      <span>Active: {member.activeCount}</span>
                      <span>Completed: {member.completedCount}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}

function CheckBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M8 12.2 10.7 15 16 9.2" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function BoardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M9 8v8M15 8v4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M8 3.5v4M16 3.5v4M3.5 10.5h17" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16.5 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M4.5 19a4 4 0 0 1 8 0M14 19a3.5 3.5 0 0 1 5.5-2.8" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19.5h14" />
      <path d="M7.5 17v-6M12 17V7M16.5 17v-9" />
    </svg>
  );
}

function ListCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 7.5h9M9 12h9M9 16.5h6" />
      <path d="m4.5 7.4.9.9 1.8-1.8M4.5 11.9l.9.9 1.8-1.8" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.2 2.3 4.8-4.9" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v4.7l3 1.8" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 4 8 14H4l8-14Z" />
      <path d="M12 9.2v4.6M12 17h.01" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 19c-4 1.5-4-2-6-2" />
      <path d="M15 22v-3.8a3.2 3.2 0 0 0-.9-2.5c3-.3 6.4-1.5 6.4-7A5.3 5.3 0 0 0 19 5a4.9 4.9 0 0 0-.1-3.8S17.7.8 15 2.5a12.8 12.8 0 0 0-6 0C6.3.8 5.1 1.2 5.1 1.2A4.9 4.9 0 0 0 5 5a5.3 5.3 0 0 0-1.5 3.7c0 5.5 3.4 6.7 6.4 7a3.2 3.2 0 0 0-.9 2.5V22" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 4 6.9 7.7L4.6 20" />
      <path d="M20 4 13 12l7 8" />
      <path d="M8 4h3l5 16h-3z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 8h3V4h-3a5 5 0 0 0-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export default App;
