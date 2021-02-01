import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import React from 'react';
import styles from './styles.module.css';

export interface FeatureItem {
    title: string;
    description: React.ReactNode;
    imageUrl?: string;
}

function Feature({ imageUrl, title, description }: FeatureItem): JSX.Element {
    const imgUrl = useBaseUrl(imageUrl);
    return (
        <div className={clsx('col col--12', styles.feature)}>
            {imgUrl && (
                <div className='text--center'>
                    <img className={styles.featureImage} src={imgUrl} alt={title} />
                </div>
            )}
            <h3>{title}</h3>
            {description}
        </div>
    );
}

export default Feature;
