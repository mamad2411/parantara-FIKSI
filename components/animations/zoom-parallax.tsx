'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

interface Image {
	src: string;
	alt?: string;
}

interface ZoomParallaxProps {
	/** Array of images to be displayed in the parallax effect max 7 images */
	images: Image[];
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
	const container = useRef(null);
	const mockupRef = useRef(null);
	
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start center', 'end end'],
	});

	const { scrollYProgress: mockupProgress } = useScroll({
		target: mockupRef,
		offset: ['start end', 'end start'],
	});

	const scale4 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 4]);
	const scale5 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 5]);
	const scale6 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 6]);
	const scale8 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 8]);
	const scale9 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 9]);

	// Staggered entrance animations for each image
	const opacity1 = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
	const opacity2 = useTransform(scrollYProgress, [0.02, 0.12], [0, 1]);
	const opacity3 = useTransform(scrollYProgress, [0.04, 0.16], [0, 1]);
	const opacity4 = useTransform(scrollYProgress, [0.06, 0.20], [0, 1]);
	const opacity5 = useTransform(scrollYProgress, [0.08, 0.24], [0, 1]);
	const opacity6 = useTransform(scrollYProgress, [0.10, 0.28], [0, 1]);
	const opacity7 = useTransform(scrollYProgress, [0.12, 0.32], [0, 1]);

	// Initial scale animations (start smaller, grow to normal)
	const initialScale1 = useTransform(scrollYProgress, [0, 0.08], [0.5, 1]);
	const initialScale2 = useTransform(scrollYProgress, [0.02, 0.12], [0.5, 1]);
	const initialScale3 = useTransform(scrollYProgress, [0.04, 0.16], [0.5, 1]);
	const initialScale4 = useTransform(scrollYProgress, [0.06, 0.20], [0.5, 1]);
	const initialScale5 = useTransform(scrollYProgress, [0.08, 0.24], [0.5, 1]);
	const initialScale6 = useTransform(scrollYProgress, [0.10, 0.28], [0.5, 1]);
	const initialScale7 = useTransform(scrollYProgress, [0.12, 0.32], [0.5, 1]);

	// Y position animations (slide up from below)
	const initialY1 = useTransform(scrollYProgress, [0, 0.08], [50, 0]);
	const initialY2 = useTransform(scrollYProgress, [0.02, 0.12], [50, 0]);
	const initialY3 = useTransform(scrollYProgress, [0.04, 0.16], [50, 0]);
	const initialY4 = useTransform(scrollYProgress, [0.06, 0.20], [50, 0]);
	const initialY5 = useTransform(scrollYProgress, [0.08, 0.24], [50, 0]);
	const initialY6 = useTransform(scrollYProgress, [0.10, 0.28], [50, 0]);
	const initialY7 = useTransform(scrollYProgress, [0.12, 0.32], [50, 0]);

	const mockupY = useTransform(mockupProgress, [0, 1], [100, -100]);
	const mockupScale = useTransform(mockupProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

	// Combined scales (initial * zoom) - using proper syntax for multiple MotionValues
	const combinedScale1 = useTransform(() => initialScale1.get() * scale4.get());
	const combinedScale2 = useTransform(() => initialScale2.get() * scale5.get());
	const combinedScale3 = useTransform(() => initialScale3.get() * scale6.get());
	const combinedScale4 = useTransform(() => initialScale4.get() * scale5.get());
	const combinedScale5 = useTransform(() => initialScale5.get() * scale6.get());
	const combinedScale6 = useTransform(() => initialScale6.get() * scale8.get());
	const combinedScale7 = useTransform(() => initialScale7.get() * scale9.get());

	const combinedScales = [combinedScale1, combinedScale2, combinedScale3, combinedScale4, combinedScale5, combinedScale6, combinedScale7];
	const opacities = [opacity1, opacity2, opacity3, opacity4, opacity5, opacity6, opacity7];
	const initialYs = [initialY1, initialY2, initialY3, initialY4, initialY5, initialY6, initialY7];

	return (
		<>
			<div ref={container} className="relative h-[200vh] bg-white">
				<div className="sticky top-0 h-screen overflow-hidden">
					<div className="absolute inset-0 flex items-center justify-center translate-y-[10vh]">
						{images.map(({ src, alt }, index) => {
							const combinedScale = combinedScales[index % combinedScales.length];
							const opacity = opacities[index % opacities.length];
							const initialY = initialYs[index % initialYs.length];

						// Text cards for index 2, 3, and 6 with geometric patterns
						if (index === 2) {
							return (
								<motion.div
									key={index}
									style={{ 
										scale: combinedScale,
										opacity,
										y: initialY
									} as any}
									className="absolute inset-0 flex items-center justify-center [&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]"
								>
									<div className="relative h-[45vh] w-[20vw] bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 flex flex-col justify-center shadow-lg border border-white/20 overflow-hidden">
										{/* Geometric pattern overlay */}
										<div className="absolute inset-0 opacity-5">
											<div className="absolute top-0 right-0 w-24 h-24">
												<svg viewBox="0 0 100 100" className="w-full h-full">
													<polygon points="0,0 100,0 50,50" fill="#3B82F6" />
													<polygon points="0,0 0,100 50,50" fill="#2563EB" />
												</svg>
											</div>
										</div>
										
										<p className="text-xs md:text-sm font-semibold text-blue-900 mb-2 relative z-10">QS. At-Taubah: 103</p>
										<p className="text-sm md:text-base text-gray-800 mb-3 text-right leading-relaxed relative z-10" style={{ fontFamily: 'serif' }}>
											خُذْ مِنْ أَمْوَٰلِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا
										</p>
										<p className="text-[10px] md:text-xs text-gray-600 leading-relaxed italic relative z-10">
											&quot;Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka...&quot;
										</p>
									</div>
								</motion.div>
							);
						}

						if (index === 3) {
							return (
								<motion.div
									key={index}
									style={{ 
										scale: combinedScale,
										opacity,
										y: initialY
									} as any}
									className="absolute inset-0 flex items-center justify-center [&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]"
								>
									<div className="relative h-[25vh] w-[25vw] bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 flex flex-col justify-center shadow-lg border border-white/20 overflow-hidden">
										{/* Geometric pattern overlay */}
										<div className="absolute inset-0 opacity-5">
											<div className="absolute bottom-0 left-0 w-20 h-20">
												<svg viewBox="0 0 100 100" className="w-full h-full">
													<rect x="0" y="0" width="40" height="40" fill="#3B82F6" />
													<rect x="60" y="0" width="40" height="40" fill="#2563EB" />
													<rect x="0" y="60" width="40" height="40" fill="#1D4ED8" />
													<rect x="60" y="60" width="40" height="40" fill="#3B82F6" />
												</svg>
											</div>
										</div>
										
										<p className="text-xs md:text-sm font-semibold text-blue-900 mb-2 relative z-10">QS. Al-Hadid: 7</p>
										<p className="text-sm md:text-base text-gray-800 mb-2 text-right leading-relaxed relative z-10" style={{ fontFamily: 'serif' }}>
											وَأَنفِقُوا مِمَّا جَعَلَكُم مُّسْتَخْلَفِينَ فِيهِ
										</p>
										<p className="text-[10px] md:text-xs text-gray-600 leading-relaxed italic relative z-10">
											&quot;...dan nafkahkanlah sebagian dari hartamu...&quot;
										</p>
									</div>
								</motion.div>
							);
						}

						// Center bottom text card with white background, blue and yellow text, and geometric patterns
						if (index === 6) {
							return (
								<motion.div
									key={index}
									style={{ 
										scale: combinedScale,
										opacity,
										y: initialY
									} as any}
									className="absolute inset-0 flex items-center justify-center [&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]"
								>
									<div className="relative h-[15vh] w-[15vw] bg-white rounded-3xl p-2 md:p-3 flex items-center justify-center shadow-xl overflow-hidden border border-slate-100">
										{/* Geometric patterns background */}
										<div className="absolute inset-0 opacity-10">
											{/* Top left triangles */}
											<div className="absolute top-0 left-0 w-12 h-12">
												<svg viewBox="0 0 100 100" className="w-full h-full">
													<polygon points="0,0 50,0 0,50" fill="#3B82F6" />
													<polygon points="50,0 100,0 50,50" fill="#2563EB" />
													<polygon points="0,50 50,50 0,100" fill="#1D4ED8" />
												</svg>
											</div>
											{/* Bottom right circles */}
											<div className="absolute bottom-0 right-0 w-16 h-16">
												<svg viewBox="0 0 100 100" className="w-full h-full">
													<circle cx="25" cy="25" r="15" fill="#3B82F6" />
													<circle cx="75" cy="25" r="15" fill="#2563EB" />
													<circle cx="25" cy="75" r="15" fill="#1D4ED8" />
													<circle cx="75" cy="75" r="15" fill="#3B82F6" />
												</svg>
											</div>
											{/* Center geometric shapes */}
											<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20">
												<svg viewBox="0 0 100 100" className="w-full h-full">
													<rect x="10" y="10" width="30" height="30" fill="#3B82F6" />
													<rect x="60" y="10" width="30" height="30" fill="#2563EB" />
													<rect x="10" y="60" width="30" height="30" fill="#1D4ED8" />
													<rect x="60" y="60" width="30" height="30" fill="#3B82F6" />
												</svg>
											</div>
										</div>
										
										<h3 className="relative text-[8px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base font-bold text-center leading-tight px-1 z-10">
											<span className="text-yellow-500">Jadikan</span>{' '}
											<span className="text-blue-600">Dana</span>
											<br />
											<span className="text-blue-600">Masjid</span>{' '}
											<span className="text-yellow-500">sebagai</span>
											<br />
											<span className="text-yellow-500">panduan untuk</span>
											<br />
											<span className="text-yellow-500">memakmurkan</span>
											<br />
											<span className="text-blue-600">Masjid</span>
										</h3>
									</div>
								</motion.div>
							);
						}

						return (
							<motion.div
								key={index}
								style={{ 
									scale: combinedScale,
									opacity,
									y: initialY
								} as any}
								className={`absolute inset-0 flex items-center justify-center ${
									index === 0 ? '' :
									index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : 
									index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : 
									index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : 
									''
								}`}
							>
								<div className="relative h-[25vh] w-[25vw]">
									<img
										src={src || '/placeholder.svg'}
										alt={alt || `Parallax image ${index + 1}`}
										className="h-full w-full object-cover rounded-2xl"
										style={{ backfaceVisibility: 'hidden', WebkitFontSmoothing: 'antialiased' }}
									/>
								</div>
							</motion.div>
						);
					})}
					</div>
				</div>
			</div>
			
			<div ref={mockupRef} className="relative py-20 px-0 overflow-visible -mt-100 md:-mt-140 lg:-mt-192">
				<div className="w-full mx-auto">
					<motion.div 
						style={{ y: mockupY, scale: mockupScale }}
						className="flex justify-center items-center"
					>
					</motion.div>
				</div>
			</div>

			<style jsx>{`
				img {
					-webkit-backface-visibility: hidden;
					-moz-backface-visibility: hidden;
					backface-visibility: hidden;
					-webkit-transform: translateZ(0) scale(1.0, 1.0);
					transform: translateZ(0);
					image-rendering: -webkit-optimize-contrast;
					image-rendering: crisp-edges;
				}
				
				div {
					-webkit-backface-visibility: hidden;
					-moz-backface-visibility: hidden;
					backface-visibility: hidden;
				}
			`}</style>
		</>
	);
}
