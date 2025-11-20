declare global {

	interface SysInfo {
		cpu: {
			total: number;
			perCore: number[];
		},
		mem: {
			usedPercent: number;
			total: number;
			used: number;
		},
		network: {
			tx: number;
			rx: number;
			speed: number;
		},
		timestamp: number;
	};

	interface SysMetric {
		metric: number | number[];
		timestamp: number;
		max?: number;
	};

	interface SysChartDefiniton {
		title: string;
		description: string;
		chartData: SysMetric[];
		labels?: string[];
	};

};

export { };