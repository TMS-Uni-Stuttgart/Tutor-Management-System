import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';
import Feature, { FeatureItem } from '../components/feature/Feature';
import styles from './styles.module.css';

const features: FeatureItem[] = [
    {
        title: 'Track Exam Requirements',
        description: (
            <>
                <p>
                    This tool makes it easy to track if your students meet the requirements to
                    attend the final exam of the term. The tool is developed at the University of
                    Stuttgart and supports several requirements (ie pass enough homeworks, tests,
                    ...).
                </p>
                <p>You can find more information about the tool in this documentation.</p>
            </>
        ),
    },
];

function Home(): JSX.Element {
    const context = useDocusaurusContext();
    const { siteConfig = {} } = context;
    return (
        <Layout
            title={`${siteConfig.title} Documentation`}
            description='Documentation of the Tutor-Management-System.'
        >
            <header className={clsx('hero hero--primary', styles.heroBanner)}>
                <div className='container'>
                    <h1 className='hero__title'>{siteConfig.title}</h1>
                    <p className='hero__subtitle'>{siteConfig.tagline}</p>
                    <div className={styles.buttons}>
                        <Link
                            className={clsx(
                                'button button--outline button--secondary button--lg',
                                styles.bigButton
                            )}
                            to={useBaseUrl('docs/handbook/introduction')}
                        >
                            Handbook
                        </Link>
                        <Link
                            className={clsx(
                                'button button--outline button--secondary button--lg',
                                styles.bigButton
                            )}
                            to={useBaseUrl('docs/setup/installation')}
                        >
                            Installation
                        </Link>
                    </div>
                </div>
            </header>
            <main>
                {features && features.length > 0 && (
                    <section className={styles.features}>
                        <div className='container'>
                            <div className='row'>
                                {features.map((props, idx) => (
                                    <Feature key={idx} {...props} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </Layout>
    );
}

export default Home;
