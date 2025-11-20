import si from "systeminformation";

export async function getSystemInfo(): Promise<SysInfo> {

	const cpu = await si.currentLoad();
	const mem = await si.mem();
	const network = await si.networkStats();
	const interfaces = await si.networkInterfaces();

	const cpuData = {
		total: cpu.currentLoad,
		perCore: cpu.cpus.map(c => c.load),
	};

	const memData = {
		usedPercent: (mem.used / mem.total) * 100,
		total: mem.total,
		used: mem.used,
	};

	const ifaceStats = network.find(n => n.operstate === "up") || network[0];
	const ifaceInfo = interfaces.find(i => i.iface === ifaceStats?.iface);

	const rxMbps = ((ifaceStats?.rx_sec ?? 0) * 8) / 1_000_000;
	const txMbps = ((ifaceStats?.tx_sec ?? 0) * 8) / 1_000_000;

	const netData = {
		rx: rxMbps,
		tx: txMbps,
		speed: ifaceInfo?.speed ?? 0
	};

	return {
		cpu: cpuData,
		mem: memData,
		network: netData,
		timestamp: Date.now()
	};

};