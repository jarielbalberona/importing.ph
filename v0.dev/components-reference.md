
```typescript
// importing.ph - Component Reference for v0.dev

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Available shadcn/ui components in this project
export const AvailableComponents = {
  Button,
  Card,
  Badge,
  Input,
  Label,
  Select,
  Textarea,
  Dialog,
  Table,
  Tabs,
  // Add more as needed
}

// Common patterns used in the project
export const CommonPatterns = {
  // Status badges
  statusBadges: {
    open: <Badge variant="outline">Open</Badge>,
    quoted: <Badge variant="secondary">Quoted</Badge>,
    accepted: <Badge variant="default">Accepted</Badge>,
    closed: <Badge variant="destructive">Closed</Badge>
  },
  
  // Action buttons
  primaryAction: <Button>Create Shipment</Button>,
  secondaryAction: <Button variant="outline">View Details</Button>,
  
  // Card layouts
  statsCard: (
    <Card>
      <CardHeader>
        <CardTitle>Total Shipments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">24</div>
      </CardContent>
    </Card>
  )
}
```