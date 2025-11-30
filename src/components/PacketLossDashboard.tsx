import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Activity, Wifi, Clock, Package, HardDrive, Cpu } from "lucide-react";

interface NetworkMetrics {
  timestamp: number;
  packetLoss: number;
  jitter: number;
  latency: number;
  outOfOrder: number;
  bufferSize: number;
  activeThreads: number;
}

interface PacketLossDashboardProps {
  metrics: NetworkMetrics[];
  currentMetrics: NetworkMetrics | null;
}

const PacketLossDashboard = ({ metrics, currentMetrics }: PacketLossDashboardProps) => {
  const [timeRange, setTimeRange] = useState<"1m" | "5m" | "15m">("5m");

  // Filter metrics based on time range
  const getFilteredMetrics = () => {
    if (!currentMetrics) return [];
    
    const now = Date.now();
    const rangeMs = timeRange === "1m" ? 60000 : timeRange === "5m" ? 300000 : 900000;
    const cutoff = now - rangeMs;
    
    return metrics.filter(m => m.timestamp >= cutoff);
  };

  const filteredMetrics = getFilteredMetrics();

  // Format timestamp for display
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Get status color based on value
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "text-green-500";
    if (value <= thresholds.warning) return "text-yellow-500";
    return "text-red-500";
  };

  const getStatusBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "default";
    if (value <= thresholds.warning) return "secondary";
    return "destructive";
  };

  if (!currentMetrics) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No network metrics available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Packet Loss Visualization Dashboard
            </CardTitle>
            <CardDescription>Real-time network performance metrics</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={timeRange === "1m" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeRange("1m")}
            >
              1m
            </Badge>
            <Badge
              variant={timeRange === "5m" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeRange("5m")}
            >
              5m
            </Badge>
            <Badge
              variant={timeRange === "15m" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeRange("15m")}
            >
              15m
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Packet Loss</span>
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.packetLoss, { good: 1, warning: 5 })}`}>
              {currentMetrics.packetLoss.toFixed(2)}%
            </div>
            <Badge variant={getStatusBadge(currentMetrics.packetLoss, { good: 1, warning: 5 })} className="mt-1 text-xs">
              {currentMetrics.packetLoss <= 1 ? "Excellent" : currentMetrics.packetLoss <= 5 ? "Good" : "Poor"}
            </Badge>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Jitter</span>
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.jitter, { good: 10, warning: 30 })}`}>
              {currentMetrics.jitter.toFixed(1)}ms
            </div>
            <Badge variant={getStatusBadge(currentMetrics.jitter, { good: 10, warning: 30 })} className="mt-1 text-xs">
              {currentMetrics.jitter <= 10 ? "Low" : currentMetrics.jitter <= 30 ? "Medium" : "High"}
            </Badge>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Latency</span>
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.latency, { good: 50, warning: 150 })}`}>
              {currentMetrics.latency.toFixed(0)}ms
            </div>
            <Badge variant={getStatusBadge(currentMetrics.latency, { good: 50, warning: 150 })} className="mt-1 text-xs">
              {currentMetrics.latency <= 50 ? "Low" : currentMetrics.latency <= 150 ? "Medium" : "High"}
            </Badge>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Out-of-Order</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {currentMetrics.outOfOrder}
            </div>
            <Badge variant={currentMetrics.outOfOrder === 0 ? "default" : "destructive"} className="mt-1 text-xs">
              {currentMetrics.outOfOrder === 0 ? "None" : "Detected"}
            </Badge>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Buffer Size</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {(currentMetrics.bufferSize / 1024).toFixed(1)}KB
            </div>
            <Badge variant="outline" className="mt-1 text-xs">
              {currentMetrics.bufferSize < 8192 ? "Small" : currentMetrics.bufferSize < 16384 ? "Medium" : "Large"}
            </Badge>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Active Threads</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {currentMetrics.activeThreads}
            </div>
            <Badge variant="outline" className="mt-1 text-xs">
              Active
            </Badge>
          </div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="packet-loss">Packet Loss</TabsTrigger>
            <TabsTrigger value="latency">Latency & Jitter</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    labelFormatter={(value) => formatTime(value as number)}
                    formatter={(value: number, name: string) => {
                      if (name === "packetLoss") return [`${value.toFixed(2)}%`, "Packet Loss"];
                      if (name === "jitter") return [`${value.toFixed(1)}ms`, "Jitter"];
                      if (name === "latency") return [`${value.toFixed(0)}ms`, "Latency"];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="packetLoss"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.2}
                    name="Packet Loss %"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="jitter"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.2}
                    name="Jitter (ms)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="latency"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    name="Latency (ms)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="packet-loss" className="mt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                  />
                  <YAxis label={{ value: "Packet Loss %", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    labelFormatter={(value) => formatTime(value as number)}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, "Packet Loss"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="packetLoss"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name="Packet Loss %"
                  />
                  <Line
                    type="monotone"
                    dataKey="outOfOrder"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    name="Out-of-Order Packets"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="latency" className="mt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                  />
                  <YAxis label={{ value: "Time (ms)", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    labelFormatter={(value) => formatTime(value as number)}
                    formatter={(value: number, name: string) => {
                      if (name === "latency") return [`${value.toFixed(0)}ms`, "Latency"];
                      if (name === "jitter") return [`${value.toFixed(1)}ms`, "Jitter"];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Latency (ms)"
                  />
                  <Line
                    type="monotone"
                    dataKey="jitter"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    name="Jitter (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                  />
                  <YAxis yAxisId="left" label={{ value: "Buffer Size (KB)", angle: -90, position: "insideLeft" }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: "Threads", angle: 90, position: "insideRight" }} />
                  <Tooltip
                    labelFormatter={(value) => formatTime(value as number)}
                    formatter={(value: number, name: string) => {
                      if (name === "bufferSize") return [`${(value / 1024).toFixed(1)}KB`, "Buffer Size"];
                      if (name === "activeThreads") return [value, "Active Threads"];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bufferSize"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name="Buffer Size (bytes)"
                    strokeDasharray="5 5"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="activeThreads"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    name="Active Threads"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PacketLossDashboard;

