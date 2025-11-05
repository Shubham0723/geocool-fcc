'use client'
import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ACServiceSchedule } from "@/lib/types";

export default function ACServiceSchedule() {
    const [items, setItems] = useState<ACServiceSchedule[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selected, setSelected] = useState<ACServiceSchedule | null>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showAdd, setShowAdd] = useState<boolean>(false);
    const [form, setForm] = useState<{ hours: string; km: string; serviceDate: string }>({ hours: '', km: '', serviceDate: '' });

    useEffect(() => {
        const run = async () => {
            try {
                const res = await fetch('/api/ac-service', { cache: 'no-store' });
                const data = await res.json();
                setItems(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error('Failed to fetch AC services', e);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    const openModal = (item: ACServiceSchedule) => {
        setSelected(item);
        setOpen(true);
    };

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) {
            return items;
        }
        const query = searchQuery.trim().toUpperCase();
        return items.filter((item) => {
            const vehicleNumber = item.vehicleNumber.toUpperCase();
            // Match full vehicle number or last 4 digits
            return vehicleNumber === query || vehicleNumber.endsWith(query);
        });
    }, [items, searchQuery]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AC Service Schedule</h1>
                <div className="w-full sm:w-auto">
                    <Input
                        type="text"
                        placeholder="Search by vehicle number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64"
                    />
                </div>
            </div>

            <table className="w-full min-w-[900px]">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Vehicle Number</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Model</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Make</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">AC Sr. No</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">AC Unit</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="py-4 text-center text-gray-500">Loading…</td>
                        </tr>
                    ) : filteredItems.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-4 text-center text-gray-500">No records found</td>
                        </tr>
                    ) : (
                        filteredItems.map((item) => (
                            <tr key={String(item._id)} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => openModal(item)}>
                                <td className="py-3 px-4">{item.vehicleNumber}</td>
                                <td className="py-3 px-4">{item.model}</td>
                                <td className="py-3 px-4">{item.make ?? '-'}</td>
                                <td className="py-3 px-4">{item.acSerialNumber ?? '-'}</td>
                                <td className="py-3 px-4">{item.acUnit ?? '-'}</td>
                                <td className="py-3 px-4">{item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh]">
                    <div className="flex items-center justify-between pr-12">
                        <DialogHeader>
                            <DialogTitle>AC Service Records - {selected?.vehicleNumber}</DialogTitle>
                        </DialogHeader>
                        <Button size="sm" className="mr-2" onClick={() => setShowAdd(true)}>Add</Button>
                    </div>
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                        {selected?.services?.length ? (
                            selected.services.map((s, idx) => (
                                <div key={idx} className="rounded-md border p-4 text-base">
                                    <div className="font-semibold text-gray-900 mb-2">Service No - {idx + 1}</div>
                                    <div className="text-gray-700">KM: {s.km}</div>
                                    <div className="text-gray-700">Hours: {s.hours}</div>
                                    <div className="text-gray-700">Service Date: {s.serviceDate ? new Date(s.serviceDate).toLocaleDateString() : '-'}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500">No service records.</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Service Item Modal */}
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add AC Service - {selected?.vehicleNumber}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Hours</label>
                            <Input type="text" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">KM</label>
                            <Input type="text" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Service Date</label>
                            <Input type="date" value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                            <Button onClick={async () => {
                                if (!selected) return;
                                const payload = {
                                    hours: form.hours,
                                    km: form.km,
                                    serviceDate: form.serviceDate ? new Date(form.serviceDate) : new Date(),
                                };
                                await fetch(`/api/ac-service/${String(selected._id)}/service`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(payload),
                                });
                                const res = await fetch('/api/ac-service', { cache: 'no-store' });
                                const data = await res.json();
                                if (Array.isArray(data)) {
                                    setItems(data);
                                    const updated = data.find((v: ACServiceSchedule) => String(v._id) === String(selected._id));
                                    if (updated) setSelected(updated);
                                }
                                setShowAdd(false);
                                setForm({ hours: '', km: '', serviceDate: '' });
                            }}>Save</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
