package com.akaar.core.data.di

import com.akaar.core.common.AppDispatchers
import com.akaar.core.common.DefaultAppDispatchers
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DataModule {

    @Provides
    @Singleton
    fun provideDispatchers(): AppDispatchers = DefaultAppDispatchers()
}
