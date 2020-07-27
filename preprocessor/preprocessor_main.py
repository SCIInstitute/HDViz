from glob import glob
from PIL import Image
import json
import numpy as np
import os
import pandas as pd
import re
import shutil
import sys
from sklearn.manifold import TSNE, Isomap, MDS
import yaml

from distances.nrrd_distances import calculate_distance_volume
from distances.png_distances import calculate_distance_png
from thumbnails.nanoparticles_thumbnails import generate_nano_thumbnails
from utils import run_external_script


def process_data(config):
    # OUTPUT DIRECTORY AND INITIALIZE OUTPUT CONFIG
    output_directory = config['outputDirectory']
    output_directory = os.path.join(output_directory, '')
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    output_config = {'name': config['datasetName'], 'samples': {'count': config['numberSamples']}}

    # PARAMETERS AND QOIS
    print('Reading parameters.')
    parameters_df = pd.read_csv(config['parametersFile'])
    # TODO calculate summary statistics for each parameter (mean, mode, variance, these could be displayed in client)
    parameters_df.to_csv(output_directory + config['datasetName'] + '_Parameters.csv', index=False)
    output_config['parameters'] = {'format': 'csv', 'file': config['datasetName'] + '_Parameters.csv'}

    print('Reading QoIs.')
    qois_df = pd.read_csv(config['qoisFile'])
    # TODO calculate summary statistics for each qoi (mean, mode, variance, these could be displayed in client)
    qois_df.to_csv(output_directory + config['datasetName'] + '_QoIs.csv', index=False)
    output_config['qois'] = {'format': 'csv', 'file': config['datasetName'] + '_QoIs.csv'}

    # THUMBNAILS
    thumbnail_config = generate_thumbnails(config, output_directory)
    output_config.update(thumbnail_config)

    # DISTANCES
    distance_config, distance = calculate_distance(config, output_directory)
    output_config.update(distance_config)

    # EMBEDDINGS
    embedding_config = calculate_embeddings(distance, config, output_directory)
    output_config.update(embedding_config)

    print('Generating config.yaml for dataset.')
    with open(output_directory + 'config.yaml', 'w') as file:
        yaml.dump(output_config, file, default_flow_style=False, sort_keys=False, line_break=2)
    print('Data processing complete.')
    print('Run the dSpaceX server with: --datapath ' + output_directory)
    print('Happy Exploring!')


def generate_thumbnails(input_config, output_directory):
    """
    Generates the thumbnails specified by input_config and saves the in an 'images' folder
    in the output_directory.
    Returns a dictionary that contains the thumbnail information for the config.yaml.
    The returned dictionary will need to be merged with the entire_output config.
    :param input_config: Configuration file with preprocessor specifications and settings
    :param output_directory: Directory where data should be saved
    :return: A dictionary that contains the thumbnail information for the config.yaml.
    """
    shape_directory = os.path.join(input_config['shapeDirectory'], '')

    output_config = {}
    out = output_directory + 'images/'
    if not os.path.exists(out):
        os.makedirs(out)

    thumbnails = input_config['thumbnails']
    if verify_thumbnails(thumbnails) is False:
        print('Sorry I only know how to make thumbnails for Nanoparticles and png images.'
              ' Skipping thumbnails generation.')
        return

    # Generate thumbnails
    if thumbnails == 'nano':
        print('Generating Nanoparticle thumbnails.')
        generate_nano_thumbnails(output_directory + input_config['datasetName'] + '_Parameters.csv', out, add_slices=False)
    elif thumbnails == 'png':
        print('Generating png thumbnails.')
        image_files = glob(shape_directory + '*.png')
        for file in image_files:
            image_id = list(map(int, re.findall(r'\d+', file)))[-1]
            img = Image.open(file)
            img.save(output_directory + 'images/' + str(image_id) + '.png')

    output_config['thumbnails'] = {'format': 'png', 'files': 'images/?.png', 'offset': 1, 'padZeros': 'false'}
    return output_config


def verify_thumbnails(thumbnails):
    supported_thumbnails = ['nano', 'png']
    if thumbnails in supported_thumbnails:
        return True
    else:
        return False


def calculate_distance(input_config, output_directory):
    shape_directory = os.path.join(input_config['shapeDirectory'], '')
    distance_type = input_config['distance']['type'].lower()
    shape_format = input_config['shapeFormat'].lower()
    output_config = {}

    # Verify we can perform calculation, if we can't clean up output directory and shut down processing pipeline
    if verify_distance_type(distance_type) is False:
        print('We\'re sorry we do not currently support the ' + distance_type +
              ' distance calculations. Supported distance calculations are listed in the README.')
        print('Closing preprocessor, please fix config and run again.')
        shutil.rmtree(output_directory)
        sys.exit()

    if verify_shape_format(shape_format) is False:
        print('We\'re sorry we do not currently support the ' + input_config['shapeFormat'] +
              ' shape format. Supported formats include nrrd and png.')
        print('Closing preprocessor, please fix config and run again.')
        shutil.rmtree(output_directory)
        sys.exit()

    if distance_type == 'precomputed':
        print('Distance is precomputed, loading from file.')
        distance = np.genfromtxt(input_config['distance']['file'], delimiter=',')
    elif distance_type == 'script':
        print('Script for distance provided, calling script.')
        script_directory = input_config['distance']['script']
        module_name = input_config['distance']['moduleName']
        method_name = input_config['distance']['methodName']
        arguments = input_config['distance']['arguments'] if 'arguments' in input_config['distance'] else None
        distance = run_external_script(script_directory, module_name, method_name, arguments=arguments)
    else:
        print('Calculating ' + distance_type + ' distance.')
        if shape_format == 'nrrd':
            distance = calculate_distance_volume(shape_directory, metric=distance_type)
        elif shape_format == 'png':
            distance = calculate_distance_png(shape_directory, metric=distance_type)

    np.savetxt(output_directory + input_config['datasetName'] + '_distance.csv', distance, delimiter=',')
    output_config['distances'] = {'format': 'csv', 'file': input_config['datasetName'] + '_distance.csv',
                                  'metric': distance_type}
    return output_config, distance


def verify_distance_type(distance_type):
    supported_distances = ['precomputed', 'script', 'cityblock', 'cosine', 'euclidean', 'l1', 'l2', 'manhattan',
                           'braycurtis', 'canberra', 'chebyshev', 'correlation', 'dice', 'hamming', 'jaccard',
                           'kulsinski', 'mahalanobis', 'minkowski', 'rogerstanimoto', 'russellrao', 'seuclidean',
                           'sokalmichener', 'sokalsneath', 'sqeuclidean', 'yule']
    if distance_type in supported_distances:
        return True
    else:
        return False


def verify_shape_format(shape_format):
    supported_shapes = ['nrrd', 'png']
    if shape_format in supported_shapes:
        return True
    else:
        return False


def calculate_embeddings(distance, input_config, output_directory):
    # Calculate default embeddings first
    print('Calculating default 2D embeddings for entire dataset.')
    tsne = TSNE(n_components=2, metric='precomputed').fit_transform(distance)
    mds = MDS(n_components=2, dissimilarity='precomputed').fit_transform(distance)
    isomap = Isomap(n_components=2, metric='precomputed').fit_transform(distance)
    np.savetxt(output_directory + input_config['datasetName'] + '_tsne.csv', tsne, delimiter=',')
    np.savetxt(output_directory + input_config['datasetName'] + '_mds.csv', mds, delimiter=',')
    np.savetxt(output_directory + input_config['datasetName'] + '_isomap.csv', isomap, delimiter=',')

    embeddings = [{'name': 't-SNE', 'format': 'csv', 'file': input_config['datasetName'] + '_tsne.csv'},
                  {'name': 'MDS', 'format': 'csv', 'file': input_config['datasetName'] + '_mds.csv'},
                  {'name': 'Isomap', 'format': 'csv', 'file': input_config['datasetName'] + '_isomap.csv'}]

    # Calculate any user specified embeddings next
    if 'embeddings' in input_config:
        print('Calculating user defined 2D embeddings for entire dataset.')
        for emb in input_config['embeddings']:
            embedding_type = emb['type'].lower()
            if embedding_type == 'precomputed':
                print('Precomputed embedding, loading from file.')
                embedding = np.genfromtxt(emb['file'], delimiter=',')
                np.savetxt(output_directory + input_config['datasetName'] + '_' + emb['name'] + '.csv', embedding,
                           delimiter=',')
            elif embedding_type == 'script':
                print('Script for embedding provided, calling script.')
                script_directory = emb['script']
                module_name = emb['moduleName']
                method_name = emb['methodName']
                arguments = emb['arguments'] if 'arguments' in emb else None
                embedding = run_external_script(script_directory, module_name, method_name, arguments=arguments)
                np.savetxt(output_directory + input_config['datasetName'] + '_' + emb['name'] + '.csv', embedding,
                           delimiter=',')
            embeddings.append({'name': emb['name'],
                               'format': 'csv',
                               'file': input_config['datasetName'] + '_' + emb['name'] + '.csv'})
    return {'embeddings': embeddings}


if __name__ == "__main__":
    config_path = sys.argv[1]
    with open(config_path) as json_file:
        _config = json.load(json_file)
    process_data(_config)
