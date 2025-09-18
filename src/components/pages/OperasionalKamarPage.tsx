import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DoorOpen, Settings, Trash2, GripVertical } from "lucide-react";
import { useAppStore, type Kamar } from "@/lib/store";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case "Tersedia":
      return "bg-green-100 text-green-800 border-green-200";
    case "Dipesan":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Dibersihkan":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Perbaikan":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Room Card Component
interface RoomCardProps {
  room: Kamar;
  tipeKamar: any;
  onStatusChange: (roomId: string) => void;
  canEdit: boolean;
}

function RoomCard({ room, tipeKamar, onStatusChange, canEdit }: RoomCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{room.nomor}</h3>
          <Badge variant="outline" className={getStatusColor(room.status)}>
            {room.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{tipeKamar?.nama}</p>
          <p className="text-sm font-medium">
            {formatCurrency(tipeKamar?.hargaDefault || 0)}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusChange(room.id)}
            disabled={!canEdit || room.status === "Dipesan"}
            className="w-full"
          >
            Ubah Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Status Change Modal Component
interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Kamar | null;
  onConfirm: (newStatus: string) => void;
}

function StatusChangeModal({
  isOpen,
  onClose,
  room,
  onConfirm,
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const { getAvailableStatusOptions } = useAppStore();

  const availableOptions = room ? getAvailableStatusOptions(room.status) : [];

  const handleConfirm = () => {
    if (selectedStatus && selectedStatus !== room?.status) {
      onConfirm(selectedStatus);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Status Kamar {room?.nomor}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Status Saat Ini</Label>
            <div className="mt-2">
              <Badge
                variant="outline"
                className={getStatusColor(room?.status || "")}
              >
                {room?.status}
              </Badge>
            </div>
          </div>
          <div>
            <Label htmlFor="newStatus">Status Baru</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih status baru" />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStatus || selectedStatus === room?.status}
          >
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Draggable Room Item for Layout Designer
interface DraggableRoomProps {
  room: Kamar;
  tipeKamar: any;
  isOverlay?: boolean;
}

function DraggableRoom({
  room,
  tipeKamar,
  isOverlay = false,
}: DraggableRoomProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: room.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 bg-white border rounded-lg shadow-sm cursor-grab hover:shadow-md transition-shadow ${
        isOverlay ? "rotate-3" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-gray-400" />
        <div>
          <p className="font-medium text-sm">{room.nomor}</p>
          <p className="text-xs text-muted-foreground">{tipeKamar?.nama}</p>
        </div>
      </div>
    </div>
  );
}

// Grid Cell Component
interface GridCellProps {
  position: number;
  room?: Kamar;
  tipeKamar?: any;
  onRemoveRoom?: (roomId: string) => void;
}

function GridCell({ position, room, tipeKamar, onRemoveRoom }: GridCellProps) {
  const { setNodeRef, isOver } = useSortable({
    id: `cell-${position}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`aspect-square border-2 border-dashed rounded-lg p-2 transition-colors ${
        isOver ? "border-primary bg-primary/10" : "border-gray-300 bg-gray-50"
      }`}
    >
      {room ? (
        <div className="h-full bg-white border rounded p-2 relative group">
          <Button
            size="sm"
            variant="destructive"
            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemoveRoom?.(room.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <p className="font-medium text-xs">{room.nomor}</p>
          <p className="text-xs text-muted-foreground truncate">
            {tipeKamar?.nama}
          </p>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
          Drop di sini
        </div>
      )}
    </div>
  );
}

export default function OperasionalKamarPage() {
  const {
    currentUser,
    kamar,
    tipeKamar,
    layoutLantai,
    updateRoomStatus,
    canUpdateRoomStatus,
    updateLayoutLantai,
    updateRoomPosition,
    getLayoutForFloor,
    getRoomsForFloor,
    getUnpositionedRoomsForFloor,
  } = useAppStore();

  // State for status view
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tipeFilter, setTipeFilter] = useState<string>("all");
  const [lantaiFilter, setLantaiFilter] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<Kamar | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // State for layout view (Admin only)
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [gridCols, setGridCols] = useState<number>(8);
  const [gridRows, setGridRows] = useState<number>(4);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Initialize layout settings when floor changes
  React.useEffect(() => {
    const layout = getLayoutForFloor(selectedFloor);
    if (layout) {
      setGridCols(layout.gridKolom);
      setGridRows(layout.gridBaris);
    }
  }, [selectedFloor, getLayoutForFloor]);

  // Filter rooms for status view
  const filteredRooms = useMemo(() => {
    return kamar.filter((room) => {
      if (statusFilter !== "all" && room.status !== statusFilter) return false;
      if (tipeFilter !== "all" && room.tipeKamarId !== tipeFilter) return false;
      if (lantaiFilter !== "all" && room.lantai !== parseInt(lantaiFilter))
        return false;
      return true;
    });
  }, [kamar, statusFilter, tipeFilter, lantaiFilter]);

  // Get unique floor numbers
  const floors = useMemo(() => {
    const floorNumbers = [...new Set(kamar.map((k) => k.lantai))].sort();
    return floorNumbers;
  }, [kamar]);

  // Layout designer data
  const unpositionedRooms = useMemo(() => {
    return getUnpositionedRoomsForFloor(selectedFloor);
  }, [getUnpositionedRoomsForFloor, selectedFloor]);

  const positionedRooms = useMemo(() => {
    return getRoomsForFloor(selectedFloor).filter(
      (room) => room.posisiLayout !== null
    );
  }, [getRoomsForFloor, selectedFloor]);

  // Handle status change
  const handleStatusChange = (roomId: string) => {
    const room = kamar.find((k) => k.id === roomId);
    if (!room) return;

    if (!canUpdateRoomStatus(roomId, room.status)) {
      toast.error("Status kamar ini tidak dapat diubah");
      return;
    }

    setSelectedRoom(room);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusChange = (newStatus: string) => {
    if (selectedRoom) {
      updateRoomStatus(selectedRoom.id, newStatus as Kamar["status"]);
      toast.success(
        `Status kamar ${selectedRoom.nomor} berhasil diubah menjadi ${newStatus}`
      );
    }
    setSelectedRoom(null);
  };

  // Handle layout operations
  const handleSaveLayout = () => {
    updateLayoutLantai(selectedFloor, gridCols, gridRows);
    toast.success(`Layout lantai ${selectedFloor} berhasil disimpan`);
  };

  const handleRemoveRoomFromGrid = (roomId: string) => {
    updateRoomPosition(roomId, selectedFloor, null);
    toast.success("Kamar berhasil dipindahkan kembali ke daftar");
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const overId = over.id as string;
    const activeId = active.id as string;

    // Check if dropping on a grid cell
    if (overId.startsWith("cell-")) {
      const position = parseInt(overId.replace("cell-", ""));
      updateRoomPosition(activeId, selectedFloor, position);
      toast.success("Posisi kamar berhasil diatur");
    }
  };

  // Generate grid cells
  const gridCells = useMemo(() => {
    const cells = [];
    const totalCells = gridCols * gridRows;

    for (let i = 0; i < totalCells; i++) {
      const room = positionedRooms.find((r) => r.posisiLayout === i);
      const roomTipe = room
        ? tipeKamar.find((t) => t.id === room.tipeKamarId)
        : undefined;

      cells.push(
        <GridCell
          key={i}
          position={i}
          room={room}
          tipeKamar={roomTipe}
          onRemoveRoom={handleRemoveRoomFromGrid}
        />
      );
    }

    return cells;
  }, [
    gridCols,
    gridRows,
    positionedRooms,
    tipeKamar,
    handleRemoveRoomFromGrid,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DoorOpen className="h-5 w-5" />
          Manajemen Kamar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status" className="w-full">
          <TabsList
            className={`grid w-full ${
              currentUser?.role === "Admin" ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            <TabsTrigger value="status">Tampilan Status Kamar</TabsTrigger>
            {currentUser?.role === "Admin" && (
              <TabsTrigger value="layout">
                <Settings className="h-4 w-4 mr-2" />
                Desain Layout Kamar
              </TabsTrigger>
            )}
          </TabsList>

          {/* Status View Tab */}
          <TabsContent value="status" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="min-w-0 flex-1">
                <Label htmlFor="statusFilter">Filter Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="Tersedia">Tersedia</SelectItem>
                    <SelectItem value="Dipesan">Dipesan</SelectItem>
                    <SelectItem value="Dibersihkan">Dibersihkan</SelectItem>
                    <SelectItem value="Perbaikan">Perbaikan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0 flex-1">
                <Label htmlFor="tipeFilter">Filter Tipe Kamar</Label>
                <Select value={tipeFilter} onValueChange={setTipeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    {tipeKamar.map((tipe) => (
                      <SelectItem key={tipe.id} value={tipe.id}>
                        {tipe.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0 flex-1">
                <Label htmlFor="lantaiFilter">Filter Lantai</Label>
                <Select value={lantaiFilter} onValueChange={setLantaiFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Lantai</SelectItem>
                    {floors.map((floor) => (
                      <SelectItem key={floor} value={floor.toString()}>
                        Lantai {floor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRooms.map((room) => {
                const roomTipe = tipeKamar.find(
                  (t) => t.id === room.tipeKamarId
                );
                return (
                  <RoomCard
                    key={room.id}
                    room={room}
                    tipeKamar={roomTipe}
                    onStatusChange={handleStatusChange}
                    canEdit={
                      currentUser?.role === "Admin" ||
                      currentUser?.role === "Resepsionis"
                    }
                  />
                );
              })}
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada kamar yang sesuai dengan filter yang dipilih.
              </div>
            )}
          </TabsContent>

          {/* Layout Designer Tab - Admin Only */}
          {currentUser?.role === "Admin" && (
            <TabsContent value="layout" className="space-y-6">
              {/* Configuration Area */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Konfigurasi Layout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <Label htmlFor="floorSelect">Pilih Lantai</Label>
                      <Select
                        value={selectedFloor.toString()}
                        onValueChange={(value) =>
                          setSelectedFloor(parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {floors.map((floor) => (
                            <SelectItem key={floor} value={floor.toString()}>
                              Lantai {floor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="gridCols">Grid Kolom</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={gridCols}
                        onChange={(e) =>
                          setGridCols(parseInt(e.target.value) || 1)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="gridRows">Grid Baris</Label>
                      <Input
                        type="number"
                        min="1"
                        max="8"
                        value={gridRows}
                        onChange={(e) =>
                          setGridRows(parseInt(e.target.value) || 1)
                        }
                      />
                    </div>
                    <Button onClick={handleSaveLayout}>
                      Simpan & Terapkan Layout
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Design Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Unpositioned Rooms */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Daftar Kamar Belum Ter-posisi
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Lantai {selectedFloor} • {unpositionedRooms.length} kamar
                    </p>
                  </CardHeader>
                  <CardContent>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="space-y-2">
                        {unpositionedRooms.map((room) => {
                          const roomTipe = tipeKamar.find(
                            (t) => t.id === room.tipeKamarId
                          );
                          return (
                            <DraggableRoom
                              key={room.id}
                              room={room}
                              tipeKamar={roomTipe}
                            />
                          );
                        })}
                      </div>
                      {unpositionedRooms.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Semua kamar sudah diposisikan
                        </p>
                      )}
                    </DndContext>
                  </CardContent>
                </Card>

                {/* Grid Layout */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Grid Layout Lantai {selectedFloor}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {gridCols} × {gridRows} grid
                      </p>
                    </CardHeader>
                    <CardContent>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={[...Array(gridCols * gridRows)].map(
                            (_, i) => `cell-${i}`
                          )}
                          strategy={rectSortingStrategy}
                        >
                          <div
                            className="grid gap-2"
                            style={{
                              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                              gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
                            }}
                          >
                            {gridCells}
                          </div>
                        </SortableContext>

                        <DragOverlay>
                          {activeId ? (
                            <DraggableRoom
                              room={unpositionedRooms.find(
                                (r) => r.id === activeId
                              )}
                              tipeKamar={tipeKamar.find(
                                (t) =>
                                  t.id ===
                                  unpositionedRooms.find(
                                    (r) => r.id === activeId
                                  )?.tipeKamarId
                              )}
                              isOverlay
                            />
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Status Change Modal */}
        <StatusChangeModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedRoom(null);
          }}
          room={selectedRoom}
          onConfirm={handleConfirmStatusChange}
        />
      </CardContent>
    </Card>
  );
}
