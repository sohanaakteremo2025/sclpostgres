import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
	},
	// Performance optimizations for development
	experimental: {
		turbo: {
			rules: {
				'*.svg': {
					loaders: ['@svgr/webpack'],
					as: '*.js',
				},
			},
		},
	},
	// Optimize webpack for faster rebuilds
	webpack: (config, { dev, isServer }) => {
		if (dev) {
			// Optimize for faster development builds
			config.watchOptions = {
				poll: 1000,
				aggregateTimeout: 300,
				ignored: /node_modules/,
			}
			
			// Reduce chunk size for faster HMR
			config.optimization = {
				...config.optimization,
				splitChunks: {
					chunks: 'all',
					cacheGroups: {
						default: {
							minChunks: 1,
							priority: -20,
							reuseExistingChunk: true,
						},
						vendor: {
							test: /[\\/]node_modules[\\/]/,
							name: 'vendors',
							priority: -10,
							chunks: 'all',
						},
					},
				},
			}
		}
		
		return config
	},
	// Enable faster refresh
	reactStrictMode: false, // Disable for faster development
	poweredByHeader: false,
}

export default nextConfig
